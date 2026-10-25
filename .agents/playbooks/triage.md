---
extends: investigation
when: Use it for `triage`, `triage label:<label>`, `triage #<N>` or `triage fix #<N>`, for `maintainer issues`, and for a udecode/plate issue URL. A Slate issue stays with `maintainer slate-issue`, and a security-shaped report with `maintainer security`.
---

# Triage

Triage turns an open udecode/plate issue into a call: what it is, whether it repeats another issue, which code owns it and what happens next. Each call is a row in `docs/triage/issues.tsv`, which only `pnpm triage` (`tooling/scripts/triage.mjs`) writes. The helper owns the row shape, the states, the stale reasons and who may record; this playbook owns the method. `maintainer` keeps GitHub I/O: issue drafts, Slate issues, PRs, security, the queue snapshot, the truth gate and the body-number rule.

## Entry points

| Request | Scope | Ends with |
| --- | --- | --- |
| `triage`, or `maintainer issues` | every open issue `pnpm triage queue` lists | records landed, drafts under Needs you |
| `triage label:<label>` | `pnpm triage queue --label <label>` | the same |
| `triage #<N>`, or a udecode/plate issue URL | issue N and its neighbors | N's record; a current one is printed and the run stops |
| `triage fix #<N>` | issue N's group | records, then the Bug fix playbook over the group |

## Who records

1. Run `pnpm triage show <N>...` first, a few issues per call. Its `session:` line says whether this session can record. Only the root session of a person's own Claude or Codex launch can, on Opus or Sol at xhigh on every turn of it and of every transcript it continues.
2. Read the whole output. When the runtime saves a long output to a file, read that file to its end; `record` refuses an issue unless every line of its text and its `seen:` line reached this session's tool results.
3. A Codex session runs `pnpm triage` outside the sandbox, because `workspace-write` blocks `ps` and writes to `.git`. It saves `show`'s output to a file in the run directory and reads that file in pieces of about 200 lines, because Codex cuts the middle out of a longer tool output.
4. A session that cannot record still triages and drafts. Its reply names each issue it could not record and says that `triage #<N>` in a fresh Opus or Sol xhigh session records it. It never starts another session to record for it, because only a person's own launch records.
5. Subagents and seats may search neighbors and trace owners, as the Extraction rule says, and return evidence. The lead reads each issue's show output itself and makes every call.

## Method

### Read

Read each issue as `show` prints it, then its neighbors: open and closed issues that share its problem, component, plugin or error, through live `gh` and, when its archive is fresh, through [gitcrawl](../rules/issue-harvester/references/gitcrawl.md). `pnpm kb <area>` and `pnpm kb plate#<N>` list the behavior law, the tagged tests and other editors' issues already recorded for the area and the issue. Read the related items and their duplicate chains, not only the first related thread. An issue is evidence to challenge, as `AGENTS.md`'s Source authority says. A security-shaped report leaves for `maintainer security` before any call, and only that report.

### Duplicates

Call an issue `dup` only when at least two evidence categories match: the user-visible problem, the reproduction or failure mode, the likely fix area, linked PRs or maintainer discussion, the browser or native edge, or the code surface. Similar titles alone never qualify, and an unclear case is `needs-repro`. A duplicate covers every numbered repro of the issue it closes. When one repro is a different kind, the issue keeps the kind its title names, or the first one its title names when it names several. Each other kind becomes a drafted new issue, which gets its own record once it is published. The kept kind's record lists the repros that left in `moved:`, such as `moved: repro 3 to a draft`, so `triage fix` and the close draft leave them out. An issue whose title names none of its kinds is `split`, recorded once each part has its own published issue.

### Kinds

Group the issues into failure kinds. A kind is one wrong result that one fix removes, as the Bug fix playbook's Redesign runs define it. Trace each kind to the code that owns it, with its `path:line`, and label the cause read or inferred. Its scope is the review scope whose owners hold that code, as the review ledger maps it, such as `editing`. Give it each miss class from `verify`'s [Why tests missed it](../rules/verify/references/sweep.md#why-tests-missed-it) that applies, with the cheapest test layer that would have failed on it. Its priority follows chips.md's Priority.

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

An active owner, PR, branch, assignee or recent claim does not change the record; `triage fix` checks them live before a fix. When fit stays unclear, the outcome is `needs-repro` or `spec`, never a guess.

### Record

| Outcome | Detail keys |
| --- | --- |
| `kind` | `scope`, `priority` (P0 to P3), `owner` (a `path:line` list), `cause` (`read` or `inferred`), optional `miss` and `moved` |
| `dup` | `of` |
| `fixed` | `commit`, `owner`, `proof` |
| `needs-repro` | `missing` |
| `not-bug` | `law` |
| `split` | `into`, two or more issue numbers |
| `spec` | `question`, optional `law` |

Detail is `key: value` pairs joined by `; `. Write the run's calls to a batch file in the run directory, a tab-separated table with the header `issue outcome detail seen why`, each `seen` the one `show` printed in this session. Run `pnpm triage record --from <batch.tsv> --dry-run`, fix each refusal, then run it without `--dry-run`. A record replaces every current head of its issue, so it also resolves a conflict. Land the register through `land.mjs` before the reply, as the Delivery rule says; a record counts for everyone else only on `next`.

### Drafts

A duplicate close, a repro ask, a `not-bug` answer or a `spec` question for the reporter is a comment draft. Write each as a file in the run directory, then save `pnpm -s triage mark <draft.md>` beside it; the marker it appends keeps the issue's record current once the comment is posted unchanged. A draft that says fixed passes `maintainer`'s truth gate first. Each draft waits under Needs you, as the Messages rule says, with its command: `gh issue comment <N> --repo udecode/plate --body-file <marked draft>`, plus `gh issue close <N> --repo udecode/plate --duplicate-of <M>` for a duplicate. After the records land, `pnpm triage labels` prints the `gh` commands that make the `triaged` label match the register; they wait under Needs you too.

## The global run

`triage` and `triage label:<label>` save `pnpm triage queue` to the run directory. It lists every open issue that is not current, conflicts first, then stale, unchecked and untriaged, grouped by scope. Take one scope at a time, so kinds that share an owner are read together. An issue whose task has started still gets its record, and its task stays with that task's session. An `unchecked` issue waits until its reads work, because `record` refuses on refs fetched last.

## Sweep domains

`verify`'s sweep runs this method on a domain's finds before any of them is filed, as its [Triage a domain](../rules/verify/references/sweep.md#triage-a-domain) says. Its finds marked bug and the domain's open `target:beta` issues group into kinds; a kind whose owner sits outside the domain joins the owner's domain. Each kind gets one issue drafted with `maintainer`'s issue-draft, each member find a numbered repro with its clip, and when an open issue already covers the kind, the draft adds the new members to it. The tester publishes each draft and closes the kind's other open issues as its duplicates; an agent publishes or closes only when the tester's request names that action. Each published issue then gets its record through `triage #<N>`.

## Fix

`triage fix #<N>` continues into a fix in the same session.

1. N's group starts from the issues that hold N's call. When N's record is `dup`, that is the issue its `of` names, followed through each `dup` record to the first issue whose record is not `dup`. When it is `split`, they are the issues its `into` names. Otherwise it is N. The group is those issues, each open issue recorded `dup` of one of them, and each open issue whose `kind` record shares an owner file with one of theirs. Triage the group until each issue has a current record or one this session wrote.
2. Check live claims, even on a current record: assignees, linked PRs (`gh issue view <N> --json assignees,closedByPullRequestsReferences`), remote branches that name the issue, recent comments that claim it, and the `tasks:` line `show` prints. A claim stops the fix unless the owner asked to take over, and a started task stays with its session.
3. Run the Bug fix playbook over every kind of the group. Two or more kinds with one owner make it a Redesign run, seeded from the records.
4. Once the fix lands, record each issue it closes as `fixed` with its commit, owner files and proof, then draft each close as Drafts says.

## Steps

Unlike pstack's investigation, triage writes register rows through `pnpm triage record` and comment drafts. Product code changes only inside `triage fix`'s Bug fix run.

- **Replace** "For motivation questions, also route through the **why** skill.": run Who records, then the Method over the request's scope. `how` and `why` stay available for tracing an owner, never required.
- **Replace** "Throughput checkpoint stays one line": the checkpoint names the queue's count by state and the scopes in the order the run takes them, or `n/a, one issue`.
- **Replace** "Produce the `how`-shaped output": the output is the landed records, the drafts and the issues this session could not record.
- **After** "Produce the `how`-shaped output": `triage fix` continues into Fix above in the same session, and its Bug fix run's close replaces this reply; every other entry hands back here.

**Reply:** the count of records landed per outcome, the queue count still not current, each draft's command under Needs you, the `labels` commands, and each issue this session could not record with the `triage #<N>` line that records it.
