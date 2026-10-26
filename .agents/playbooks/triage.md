---
extends: investigation
when: Use it for `triage`, `triage label:<label>`, `triage #<N>`, `triage fix #<N>` or `triage fix <domain>`, for `maintainer issues`, and for a udecode/plate issue URL. A Slate issue stays with `maintainer slate-issue`, and a security-shaped report with `maintainer security`.
---

# Triage

Triage turns an open udecode/plate issue into a call: what it is, whether it repeats another issue, which code owns it and what happens next. Each call is a row in `docs/triage/issues.tsv`, which only `pnpm triage` (`tooling/scripts/triage.mjs`) writes. The helper owns the row shape, the states, the stale reasons and who may record; this playbook owns the method. `maintainer` keeps GitHub I/O: issue drafts, Slate issues, PRs, security, the queue snapshot, the truth gate and the body-number rule.

## Entry points

| Request | Scope | Ends with |
| --- | --- | --- |
| `triage`, or `maintainer issues` | every open issue `pnpm triage queue` lists | records landed, comments posted, a fix run offered for each domain with a P0 or P1 kind |
| `triage label:<label>` | `pnpm triage queue --label <label>` | the same |
| `triage #<N>`, or a udecode/plate issue URL | issue N and its neighbors | N's record and its domain's fix run; a current one is printed and the run stops |
| `triage fix #<N>` | issue N's group | the claim, records, then the Bug fix playbook over what the claim holds |
| `triage fix <domain>` | the domain's group | the claim, records, then one Bug fix run over every kind the claim holds |

## Who records

1. Run `pnpm triage show <N>...` first, a few issues per call. In a `triage fix` run, only Fix step 1's claim comes before it. It prints who opened each issue, and its `session:` line says whether this session can record. Only the root session of a person's own Claude or Codex launch can, on Opus or Sol at xhigh on every turn of it and of every transcript it continues.
2. `record` saves the GitHub account `gh` is signed in as beside the model. A record by an account that `triage.owners` in `.agents/pstack.json` does not list reads `unconfirmed` until an owner triages the issue again, so an owner checks every call made in anyone else's session, its priority included. The owner's record confirms the call or replaces it. `queue` lists unconfirmed issues only for an owner, and `labels` keeps the `triaged` label off them.
3. Read the whole output. When the runtime saves a long output to a file, read that file to its end; `record` refuses an issue unless every line of its text and its `seen:` line reached this session's tool results.
4. A Codex session runs `pnpm triage` outside the sandbox, because `workspace-write` blocks `ps` and writes to `.git`. It saves `show`'s output to a file in the run directory and reads that file in pieces of about 200 lines, because Codex cuts the middle out of a longer tool output.
5. A session that cannot record still triages and drafts. Its reply names each issue it could not record and says that `triage #<N>` in a fresh Opus or Sol xhigh session records it. It never starts another session to record for it, because only a person's own launch records.
6. Subagents and seats may search neighbors and trace owners, as the Extraction rule says, and return evidence. The lead reads each issue's show output itself and makes every call.

## Method

### Read

Read each issue as `show` prints it, then its neighbors: open and closed issues that share its problem, component, plugin or error, through live `gh` and, when its archive is fresh, through [gitcrawl](../rules/issue-harvester/references/gitcrawl.md). `pnpm kb <area>` and `pnpm kb plate#<N>` list the behavior law, the tagged tests and other editors' issues already recorded for the area and the issue. Read the related items and their duplicate chains, not only the first related thread. An issue is evidence to challenge, as `AGENTS.md`'s Source authority says. A security-shaped report leaves for `maintainer security` before any call, and only that report.

### Duplicates

Call an issue `dup` only when at least two evidence categories match: the user-visible problem, the reproduction or failure mode, the likely fix area, linked PRs or maintainer discussion, the browser or native edge, or the code surface. Similar titles alone never qualify, and an unclear case is `needs-repro`. A duplicate covers every numbered repro of the issue it closes. When one repro is a different kind, the issue keeps the kind its title names, or the first one its title names when it names several. Each other kind becomes a drafted new issue, which gets its own record once it is published. The kept kind's record lists the repros that left in `moved:`, such as `moved: repro 3 to a draft`, so `triage fix` and the close draft leave them out. An issue whose title names none of its kinds is `split`, recorded once each part has its own published issue.

### Kinds

Group the issues into failure kinds. A kind is one wrong result that one fix removes, as the Bug fix playbook's Redesign runs define it. Trace each kind to the code that owns it, with its `path:line`, and label the cause read or inferred. Its scope is the review scope whose owners hold that code, as the review ledger maps it, such as `editing`. Give it each miss class from [Why tests missed it](#why-tests-missed-it) that applies, with the cheapest test layer that would have failed on it. Its priority follows chips.md's Priority.

A kind that an agent's browser cannot show, because only a real iOS or Android device or a real input method shows it, also gets `device:` listing each of `ios`, `android` and `ime` it shows on, where `ime` is a real input method in a desktop browser. Phone emulation and synthetic composition events do not count as the device or the input method, as `verify` says. Such a kind goes to the [Device lane](#device-lane).

### Why tests missed it

The class decides what the kind's fix run adds besides the fix.

| Class | What happened | What closes it |
| --- | --- | --- |
| M1 no test | Nothing at any layer runs the behavior | The fix's test at the lowest layer that sees the bug, and a row in the feature's scenario catalog, so the next agent pass drives it |
| M2 wrong layer | A model or unit test passes, and the bug lives in DOM, event or browser handling | A Plite browser test, or a Plate browser test in `apps/www/tests/browser/regressions/` |
| M3 wrong assertion | A test runs the path but checks something else, or expects the bug | The test fixed to assert what users see, and `test-audit` on the area when it holds more tests like it |
| M4 engine gap | Only Firefox, Safari, iOS or Android shows it, and no gated test runs there | A test gated in that engine; until a lane runs it, its recheck stays in that browser |
| M5 wiring gap | The tested setup differs from what the shipped kit or demo installs | A check over the shipped kits or demos, through `/pstack:correct` |
| M6 composition gap | Each feature is tested alone, and the bug needs two together | A generated check over the combinations. For a rule set or state machine whose bug shows without a browser, a formal check through `/pstack:create-formal-verification-skill`, as its own small skill |
| M7 spec gap | No law says what should happen | A row in `docs/editor-behavior/markdown-editing-spec.md` first, then the test |

When two kinds, in one run or across runs, missed for the same reason, such as two tests marked expected to fail, the fix run of the second kind runs `/pstack:correct` on that reason. It encodes the reason as architecture, a type, a lint or a test before any rule text.

### Fit Gate

A kind goes to a fix run only when it passes every line:

1. It fits root `VISION.md` and the relevant detail doctrine. A report that asks for what the law rules out is `not-bug`, with that law's path.
2. It has a current live source.
3. It has a clear owner skill, package or docs page.
4. It has an honest proof path: one exact observable case with its reported setup, input and expected result, and a final-ref replay plan. Otherwise it is `needs-repro`, naming what is missing.
5. It needs no new feature, config option or product decision. A question no law answers is `spec`, with a `law:` when one comes close.
6. It has enough public intake context for a local session, or the missing context is asked for.
7. It needs no external credentials, destructive action or public mutation without explicit authority.
8. It relies on more than its title or an AI's word.

An active owner, PR, branch, assignee or recent claim does not change the record. `pnpm triage claim` checks them before any fix, as [Fix](#fix) says. When fit stays unclear, the outcome is `needs-repro` or `spec`, never a guess.

### Record

| Outcome | Detail keys |
| --- | --- |
| `kind` | `scope`, `priority` (P0 to P3), `owner` (a `path:line` list), `cause` (`read` or `inferred`), optional `miss`, `moved` and `device` (`ios`, `android`, `ime`) |
| `dup` | `of` |
| `fixed` | `commit`, `owner`, `proof`, optional `retest` (`none` when the proof replays the reporter's own steps, otherwise what the reporter retests) |
| `needs-repro` | `missing` |
| `not-bug` | `law` |
| `split` | `into`, two or more issue numbers |
| `spec` | `question`, optional `law` |

Detail is `key: value` pairs joined by `; `. Write the run's calls to a batch file in the run directory, a tab-separated table with the header `issue outcome detail seen why`, each `seen` the one `show` printed in this session. Run `pnpm triage record --from <batch.tsv> --dry-run`, fix each refusal, then run it without `--dry-run`. A record replaces every current head of its issue, so it also resolves a conflict. Land the register through `land.mjs` before the reply, as the Delivery rule says; a record counts for everyone else only on `next`. Once the records land, offer fix runs as [Offer fix runs](#offer-fix-runs) says.

### Drafts

A duplicate close, a repro ask, a `not-bug` answer or a `spec` question for the reporter is a comment draft. A `kind` record gets a draft only when triage found something the issue lacks, such as a cause the issue left untraced or a different owner. When triage only confirms the issue, nothing is posted, because the labels and the Priority field carry the call. Write every draft as `technical-writing` says, and link each code location to a GitHub permalink pinned to a commit, because line numbers on `next` drift. A `kind` draft has up to four parts, each led by a bold label: **Cause.** with its linked code, **Not traced.** for what the reading left open, **Open decision.** for the design call a fix has to make, and **Test.** as numbered steps followed by the expected result. It leaves out a part that has nothing to say. Write each as a file in the run directory, then save `pnpm -s triage mark <draft.md>` beside it; the marker it appends keeps the issue's record current once the comment is posted unchanged. A draft that says fixed passes `maintainer`'s truth gate first. A fix comment may say the candidate fix is live on beta.platejs.org, which deploys every push to `next`, once the newest successful Deploy run on `next` contains the fix's commit. `gh run list --repo udecode/plate --workflow deploy.yml --branch next --status success --limit 1 --json headSha` prints that run's commit, and `git merge-base --is-ancestor <fix> <headSha>` exits 0 when it contains the fix. Unless the record says `retest: none`, the comment asks the reporter, by their handle, to retest their steps there as `retest:` names, to close the issue once the steps pass, and to comment when they still fail. Post each draft with `gh issue comment <N> --repo udecode/plate --body-file <marked draft>` once this session's record of that issue has landed and `gh` is signed in as an account that `triage.owners` lists, because the owner wants triage comments posted, not left as drafts (owner's word, 2026-10-26). That word is the authority the Messages rule and `maintainer` ask for, and it covers comments only. A draft that fails the truth gate, or that this session cannot post under that condition, waits under Needs you with its command, and so does `gh issue close <N> --repo udecode/plate --duplicate-of <M>` for a duplicate. After the records land, `pnpm triage labels` prints the `gh` commands that make GitHub match the register. A current record gets the `triaged` label, a `kind` record sets the Bug issue type and the org's Priority field (P0 Urgent, P1 High, P2 Medium, P3 Low), a `spec` record sets the Feature issue type, and a `needs-repro` or `dup` record gets the `needs reproduction` or `duplicate` label. A `fixed` record with `retest: none` gets its `gh issue close <N> --repo udecode/plate --reason completed` once that record has landed and its kind needs no device. Every other `fixed` record gets the `needs retest` label, so its reporter closes it after the retest. When the reporter confirms in a comment and leaves the issue open, the owner closes it. These label and close commands wait under Needs you.

## The global run

`triage` and `triage label:<label>` save `pnpm triage queue` to the run directory. It lists every open issue that is not current, conflicts first, then stale, unchecked, untriaged and, for an owner, unconfirmed, grouped by scope. Take one scope at a time, so kinds that share an owner are read together. An issue whose task has started still gets its record, and its task stays with that task's session. An `unchecked` issue waits until its reads work, because `record` refuses on refs fetched last.

## Sweep domains

`verify`'s sweep runs this method on a domain's finds before any of them is filed, as its [Triage a domain](../rules/verify/references/sweep.md#triage-a-domain) says. Its finds marked bug and the domain's open `target:beta` issues group into kinds; a kind whose owner sits outside the domain joins the owner's domain. Each kind gets one issue drafted with `maintainer`'s issue-draft, each member find a numbered repro with its clip, and when an open issue already covers the kind, the draft adds the new members to it. The tester publishes each draft and closes the kind's other open issues as its duplicates; an agent publishes or closes only when the tester's request names that action. Each published issue then gets its record through `triage #<N>`.

## Offer fix runs

A domain is the review scope a `kind` record names in `scope`. An issue whose `claim:` line, as `show` prints it, names a holder, or whose `tasks:` line names an open task, stays with that holder or task. A device kind stays in the [Device lane](#device-lane). Once a run's records land, each domain that a landed `kind` record names gets one fix-run task for the rest of its open issues, when one of their current `kind` records is P0 or P1. Offer it through the `chips` skill's Offer mode. The task's priority is its worst kind's, its `repro:` names those issues, whose numbered repros hold the exact steps, and its `writes:` names the owner files their records trace. Its finding starts with the claim its session runs first, `pnpm triage claim --domain <scope> --task <id>`, then asks for `triage fix <domain>`. The task runs at `xhigh`, because its session records triage and `record` needs xhigh on every turn. So the offer's batch also logs an `updated` row with `effort: xhigh`, and the finding says why. This overrides chips.md's Title rule for these tasks, and the effort check its Cards rule runs against that rule. When an open task builds the check a kind needs, the domain task waits on it. A domain whose other kinds are all P2 or P3 gets no task, and the run's plan lists them in Open work, or its reply when it keeps no plan. Domain tasks run by priority, P0 first, as the chips board orders them. A sweep adds its own handoff to the offer, as the sweep's [Triage a domain](../rules/verify/references/sweep.md#triage-a-domain) says.

## Device lane

A `kind` record with `device:` waits for a person who tests on that device, because an agent cannot drive a real phone or its input method. A `dup` of a device kind is in its lane too. `pnpm triage lane`, or `pnpm triage lane <device>`, lists the open device kinds, highest priority first, with each one's holder. A claim skips a device kind and its dups unless `--drives` names one of its devices. A claim with `--drives` takes only that device's kinds and their dups. It skips the desktop kinds in their group, which an agent's claim takes, so a person checks on the phone while an agent fixes the shared cause. A session passes `--drives <device>` only when the person driving it said in this session that they test on that device. That person's session runs `triage fix #<N>`, and the person runs the device recheck that the kind's miss class asks for. That recheck is the kind's device proof in the evidence packet, and where the Bug fix playbook asks for five warm runs, the person runs it five times. When a desktop kind of the group shares the device kind's owner file, the agent's run that holds the desktop kind writes the fix in that file. The person's session waits for that fix to land, then rechecks the device kind on the device and fixes only what still fails there. `verify`'s Android emulator lane, an emulator with Gboard that its [editor proof](../rules/verify/references/editor-proof.md) reference describes, can reproduce an `android` kind within that scope. The person's recheck on a real phone still closes the kind.

## Fix

`triage fix #<N>` and `triage fix <domain>` continue into a fix in the same session.

1. Claim the work first, even on a current record. `triage fix #<N>` runs `pnpm triage claim <N>`. `triage fix <domain>` runs `pnpm triage claim --domain <scope>`, with `--task <id>` only for the task whose card started this session. Pass `--session <id>` with this session's id from the runtime's session tool, as the `chips` skill does, so a started row names the session `chips` looks up.
   - **What it takes.** The claim takes N's group, which starts from the issues that hold N's call. When N's record is `dup`, that is the issue its `of` names, followed through each `dup` record to the first issue whose record is not `dup`. When it is `split`, they are the issues its `into` names. Otherwise it is N. The group is N and those issues, each open issue whose `kind` record shares an owner file with one of theirs, and every issue that a `dup` record or an open task ties to one of these, down every chain of dups. With `--task`, a domain's group is the task's issues, every other open issue whose current `kind` record names that domain and whose `tasks:` line names no open task, and each open issue recorded `dup` of one of them. Without `--task`, the claim takes the domain's kinds and each offered task the domain covers whole, a card another session holds included, and skips started tasks.
   - **What holds.** The claim checks every hold live: another session's claim, another assignee, an open PR that closes the issue or whose title or body says it fixes, closes or resolves it, a recent comment that claims it and a started task. A hold quiet for 48 hours with no commit on its owner files prints `stale` and still holds. A hold newer than this session's own claim holds too, so a rerun stops once someone else took the issue. Some signals only print as notes and hold nothing: a branch named for the issue, and an open task whose finding names the issue only in prose, which `show` lists under `mentions:`.
   - **Whole or in units.** An issue target claims its whole group or none of it. It skips the members that are closed, fixed or in another [lane](#device-lane), and one held member, or a root that is closed, fixed or in another lane, stops the whole claim. A reopened issue whose record still reads `fixed` gets `triage #<N>` first, which records it again. A domain or task target splits its group into units, each an issue with every issue its dups and open tasks tie it to. It skips each unit with a held member or with an issue outside the target, which it prints as `outside this target`, and claims the rest.
   - **What it writes.** The claim assigns this session's GitHub account on each issue it holds. The owner authorized that assignment for every claim on 2026-10-26, so the Messages rule's ask does not apply to it. The claim also logs the start of each offered, Ready task whose desktop issues it holds, after it checks the task again on the shared ledger. When a claim without `--task` or `--drives` holds kinds that no open task covers, it offers one task for them and starts it the same way. It offers none, and says why, when an issue it holds outside every task has no record yet, or when the worst of those kinds is P2 or P3.
   - **When it exits 1.** Report what it printed and end the run. That end overrides the Autopilot rule. When it exits 1 after pushing the claim, as on a failed assignment, rerun it once, and when the rerun exits 1 too, run the `pnpm triage release` line it printed.
   - **Takeovers.** Pass `--take <hold keys> --why "<owner's words>"` only when the owner said in this session to take over those holds, and `--drives` only as the [Device lane](#device-lane) says. A take names each hold it takes, an earlier take's included, and only an owner in `triage.owners` takes another account's hold. Neither a take nor a release removes anyone's GitHub assignment. Each prints the `gh issue edit` command that does, for the owner to run.
2. Triage what the claim holds until each issue has a current record or one this session wrote. A session that cannot record works from the records it finds, as the Bug fix playbook says for such a session. When a new record changes the group, such as a new `dup` or a kind on a shared owner file, or the claim offered no task because an issue had no record, run the claim again once the records land, and stop when it exits 1.
3. Run the Bug fix playbook once over every kind the claim holds, never one issue at a time, so the run sees every kind its owner shares. Two or more kinds with one owner make it a Redesign run, as that playbook's Redesign runs say, and the records seed its expected-results table. Each test carries the `[plate#N]` tag of every issue it checks in full, or whose one numbered repro it checks in full, as the Bug fix playbook says. Before it closes, the run adds what each kind's miss classes call for. The exception is an M6 check the tree lacks, which the run builds before the fix, so it tests the fix against that check. When it changes code a formal check covers, it follows that check's own skill, such as `authored-decision-order`.
4. Once the fix lands, record each issue it closes as `fixed` with its commit, owner files and proof. Add `retest: none` only when the proof replays the reporter's own steps in the browser and input they named, on the pushed commit, as `maintainer`'s truth gate asks. A Playwright WebKit run is not Safari, and a synthetic composition is not an input method, so neither counts. `record` refuses `retest: none` on a [device](#device-lane) kind. Otherwise `retest:` names what the reporter retests. Then post each fix comment as Drafts says. Log `landed` with `commit:` on each task the claim started, as chips.md's Landing says. A session that cannot record names each such issue with the `triage #<N>` line that records it, as Who records says. The claim on an issue ends once its `fixed` record lands. A run that stops without a fix frees what it holds with `pnpm triage release <N>... --why "<reason>"`.

## Steps

Unlike pstack's investigation, triage writes register rows through `pnpm triage record` and claims through `pnpm triage claim`, plus the comments it posts and fix-run offers. Product code changes only inside `triage fix`'s Bug fix run.

- **Replace** "Route through the **how** skill. For motivation questions, also route through the **why** skill.": `triage fix` first runs Fix step 1's claim, before Who records or any reading of the issues, and stops when it exits 1. Then run Who records, then the Method over the request's scope, which for `triage fix` is what the claim holds, as Fix step 2 says. `how` and `why` stay available for tracing an owner, never required.
- **Replace** "Throughput checkpoint stays one line": the checkpoint names the queue's count by state and the scopes in the order the run takes them, or `n/a, one issue`.
- **Replace** "Produce the `how`-shaped output": the output is the landed records, the comments posted, the fix runs offered and the issues this session could not record.
- **After** "Produce the `how`-shaped output": `triage fix` continues into Fix step 3 above in the same session, and its Bug fix run's close replaces this reply; every other entry hands back here.

**Reply:** the count of records landed per outcome, the queue count still not current, a link to each comment posted, the commands still under Needs you for each other draft, each duplicate close, the labels and each close `labels` printed, each fix-run task offered with its priority, each P2 or P3 domain left in Open work, and each issue this session could not record with the `triage #<N>` line that records it.
