# Issue triage: one playbook, one record, a model bar

Status: executed
Topic: pstack
Playbook: build

The owner asked how to triage every open issue at once, one issue against its neighbors, and one issue straight into a fix, and how to know an issue is already triaged and by which model ("im just scared other people triage with worse models"). Then they said "ok. let's go full potato on all your suggestions". This plan builds all of them: architect ran, a panel reviews this plan and another reviews the diff.

## Brief

### What will change?

Issues get one triage method and one shared record. You type triage, triage #N or triage fix #N, and anyone can check an issue's state. Only the reading session, on Opus or Sol at xhigh, can write a record.

### What could go wrong?

The model check trusts each person's own machine, so a forged or hand-written row still passes, and no review tier lists the file. Any commit to an issue's owner files makes its record stale, so busy areas get triaged again.

## Teach

Triage turns a public bug report into work: what it is, whether it repeats another, which code owns it and what happens next. Today four places do parts of it, and nothing records who triaged an issue or on which model.

After this change one playbook owns the method: every open issue, one with its neighbors, or one straight into a fix. Each call lands in one shared file with the commit, the issue text it read and the model and effort from the session's transcripts. The helper refuses a session with any turn below Opus or Sol at xhigh or above the cap, one that never read the whole issue, and one another agent's shell started. The playbook forbids starting a session to record any other way.

A record goes stale when the issue text, owner code, duplicate target, task or method changes. Two people triaging one issue at once leave a conflict until a later record replaces both.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Who can write a triage record | Opus or Sol at exactly xhigh on every turn of the root session and every transcript it continues, after show printed the whole issue to it; a subagent, a child thread or a session another agent's shell started is refused, and the playbook forbids starting one any other way (look) | Any model, with its model shown on the record | any model | big |
| Where the record lives | One file in the repo, read from next; no review tier lists it, so a forged row is an accepted risk (look) | A GitHub label such as opus-5.5-xhigh on each issue | label record | big |
| maintainer | Stays a skill for GitHub work: issue drafts, Slate issues, PRs, security, the queue snapshot and public claims (look) | Folded into the Triage playbook | fold maintainer | big |
| Review depth | Full potato: architect, a panel on the plan and a panel on the diff | One panel on the diff, the usual for a workflow change | diff panel only | detail |
| A plain triaged label on GitHub | A triaged label that mirrors the repo file, drafted as one batch for you to apply; it never decides anything | None; the repo file only | no label | small |
| A session that raised its effort partway | Refused, also when the raise came with a continued transcript; start a new session at xhigh | Count only the turns since its first triage command | count from triage | small |
| Fix sessions from cards | Keep their card effort; a session below the bar works from the reported repro, and the global triage picks the issue up | Fix sessions also need xhigh | bar on fixes | small |
| Round 1's grouping | Not copied in; the first xhigh triage reads it as evidence | Copied in as records marked below the bar | import round 1 | small |
| When a record goes stale | Any commit to its owner files since the commit it read | Only commits that change the owner's lines | owner lines | small |
| What issue text a record covers | Title, body, the last reopen, and every comment except bots and unchanged triage drafts a team member posted | Only comments by people outside the team | outsiders only | small |
| When a method change makes records stale | Only when the triage config's revision number goes up | Every edit to the playbook | every edit | small |
| Duplicate closes and repro asks | Drafted under Needs you for you to post | Posted by triage once you say so for a batch | post drafts | small |
| maintainer's queue snapshot and its script | Kept; its issue picks come from the triage queue | Deleted, with the triage queue replacing it | drop snapshot | small |
| Slate issues | Triaged in maintainer's Slate lane with triage.md's duplicate rule and Fit Gate; the file holds udecode/plate issues only | Repository-qualified rows in the same file | slate rows | small |
| An issue whose repros are different bugs | It keeps the bug its title names, and each other bug gets a drafted new issue; a split record is only for an issue whose title names none of them. The smoke's two sessions on #5250 handled it two different ways | Always split: file every part again and close the issue | split always | small |
| How long the helper waits on GitHub | 60 seconds for each fetch and gh call, then it reads the refs fetched last; one smoke session waited 35 minutes on a fetch | No limit | no deadline | detail |
| The five P0 fix runs and the first global triage | The fix runs go first; the global triage still records issues whose task has started and leaves the task to its session | The global triage first, then the fix runs | triage first | small |
| How the first global triage starts | You type triage in a fresh Opus or Sol xhigh session, and Open work lists it; the task ledger takes a P1 offer only for a bug with a repro or a ship-list item, and this is neither (look) | A P1 card whose repro names the untriaged count | card global triage | small |
| Where the live identity proof runs | Fresh Claude and Codex sessions started from the Terminal panel, plus detached ones, in a disposable clone whose local origin holds the ledger, so nothing lands before the diff panel | Land phase 1 first and prove against next | land phase 1 | detail |
| maintainer queue and maintainer issues | Still work; maintainer issues runs Triage | Removed | drop aliases | detail |
| Security issues | Kept out of the file | Recorded with no details | security rows | detail |
| The background-run fix in the shared lead reader | Lands in dotai in this run and syncs to every project | A copy in Plate only | plate only | detail |
| The guard's scratch-push lesson | Reverted after the lesson panel. The guard denies every plain push to next again, and a test fixture that pushes to a scratch repository names its branch something else (look) | A pass for a push that reaches none of the project's remotes, telling them apart by how the command spells its destination | scratch pass | detail |
| Push config the guard does not read | Left open. A push with no refspec that git's push settings send to next passes, and the guard's header says so. The fix reads those settings, a branch's push remote included, for every push with no refspec (look) | Read git's push config in the guard in this run | fix push config | small |
| What counts as naming a public issue | A hash and a number, alone or after a repository name, or an issues URL; prose such as step #2 also counts, and the real ledger holds no such repro | Only a hash after a repository name, and issues URLs | qualified issues only | detail |
| The pstack page link | A new page at https://claude.ai/artifact/5NABpdSVKTYNJ57igZeY98, because https://claude.ai/artifact/J9MTBVhDHUnKQZxJ3AyAx6 no longer opens, as https://claude.ai/artifact/XaMiMyTT4RWb4m9QK3zjhp did before it (safe) | No page for this subject | no page | detail |

## Public API

The commands a maintainer or tester types, and the read anyone can run on any clone.

```text before
```

```text after
triage                         (every open issue with no current record)
triage label:<label>
triage #<N>                    (one issue against its neighbors; prints its record when current)
triage fix #<N>                (triage, then Bug fix over the issue's whole group)
pnpm triage show <N>...        (current, stale with reasons, conflict, unchecked or untriaged, the issue's text and its fingerprint, and whether this session can record; --json gives the state only)
pnpm triage queue [--label <label>]
pnpm triage mark <draft.md>    (prints a drafted comment with the marker that keeps its own record current)
pnpm triage labels             (prints the gh commands that make the triaged label match the register; runs none)
```

## Main changes

- **A committed register.** `docs/triage/issues.tsv` holds one row per triage call: `id ts issue outcome detail read seen rev by prev why`. `id` is `<issue>-<ts>-<6 random hex>`, with milliseconds, so two writers at one millisecond still get two ids. `prev` lists every row id the call replaces, or `none`. `.gitattributes` gives the file `merge=union`, so concurrent landings keep every row through `land.mjs`'s rebase. Only `tooling/scripts/triage.mjs` writes it, and it holds only `udecode/plate` issues and no security issue.
- **Fresh reads.** `show`, `queue`, `labels` and `record` first fetch `next` and `refs/pstack/ledger` from the canonical remote. That is `upstream` when the clone lands through PRs and has one, as `land.mjs` picks it, and `origin` otherwise. They read the register, the policy and the ledger from those refs, merged with this checkout's unlanded rows. When a fetch fails, `show` and `queue` read the refs fetched last, so a read-only seat still sees the records, and they report every issue `unchecked` with the state those refs give. `record` and `labels` refuse instead, and they also refuse when the ledger cannot be read. An input that cannot be read at all, such as a failed `gh` read, makes each affected issue `unchecked`.
- **Provenance per row.** `by` is `<model> @<effort>` from `findLead()` in `.agents/pstack/lead.mjs`. `record` refuses:
  - when `findLead` misses;
  - when the transcript it names is a Claude subagent's, under `subagents/`, or a Codex child thread, whose thread differs from its session;
  - when another `claude` or `codex` process is an ancestor of the session's own runtime, as when an agent's shell starts it. A session that an agent starts detached, through the Terminal panel tool or through the desktop's `start_session`, passes this check, so only the playbook's rule keeps an agent from starting a session to record;
  - when any assistant record (Claude) or `turn_context` (Codex) is below the floor or above `maxEffort`, read from the whole root transcript and from every transcript it continues. A relaunch or a fork starts a new Claude transcript with a copy of the last compact boundary, uuid included, before any assistant record. Such a transcript continues the one file in its own project folder that holds that boundary after earlier turns, because a copy holds it before any turn. `record` refuses when no file or more than one file does, and its refusal names every transcript it read;
  - when those transcripts' tool results do not hold every line of the issue's text as `show` prints it, with its current `seen`, so the recording session has seen the whole issue. A saved output read back in pieces counts, line numbers included. For Codex only what a call returned to the model counts, and each string inside JSON it returned counts too, because Codex's exec tool returns a result as JSON text. `show` prints lines of at most 400 code points, because Claude Code's Read cuts a line at 2,000, and `show --json` carries no text. Each printed line starts with `<issue>:<line>`, and a wrapped piece's with a `+` after it, so a line read from another issue, version or position never counts. `seen` hashes the text before it wraps.
  The floor is `.agents/pstack.json` `triage.floor`, read from the canonical `next`, as `claude-opus-5 @xhigh` and `gpt-6.1-sol @xhigh`: a model prefix and an effort. A missing floor refuses.
- **The text a row read.** `seen` is a hash of the issue's title, body, the id of its last reopen event or `none`, and every comment except bots and unchanged triage drafts. The helper reads the reopen id from GitHub's GraphQL timeline, 50 issues per call. A later close keeps that id, and another reopen changes it. A draft is a comment by an owner, member or collaborator that ends in `<!-- triage:<hash> -->`, the hash of its own text, which `pnpm triage mark` appends. A team member's new repro, an edited draft, an outsider's marked comment and a second reopen make the record stale. Posting a draft unchanged or closing the issue does not. `show` prints `seen`, the triager passes it to `record --seen`, and `record` refuses when a fresh read differs.
- **Derived state.** `stateOf` computes the state at read time, and nothing stores it.
  - The states are `current`, `untriaged`, `conflict` (two or more heads), `unchecked` and `stale`.
  - The stale reasons are:
    - `below-floor`: the row's `by` misses today's floor;
    - `issue-changed`: `seen` differs from a fresh read;
    - `owner-moved`: a commit since `read` touches an owner path;
    - `dup-target`: the duplicate's target is not current or closed;
    - `task-ended`: the linked task closed without landing;
    - `method-changed`: the row's `rev` is below `triage.rev`.
  - Owner paths are the `owner` paths of a `kind` or `fixed` row and the `law` path of a `not-bug` row or of a `spec` row that names one. A `fixed` row names its owner files, so generated files in its commit never make it stale.
  - The issue-to-task link comes from the `repro:` token of every ledger row a task has, matching `plate#N`, a bare `#N` and an issue URL, and follows `dismissed dup` and `dismissed replaced` rows to the kept task. A task dismissed `done` counts as landed, because its fix is already on the branch. Every row counts because a fold replaces a task's `repro:`, and only `repro:` counts because a finding's prose also names unrelated issues.
  - `labels` projects the state onto a plain `triaged` label. It prints the `gh label create` command once. Where the state is `current` it adds `triaged` and removes `needs-triage`. Where the state is `stale`, `conflict` or `untriaged` it removes `triaged`, and it leaves `unchecked` issues alone. It prints all of these as `gh` commands for the owner.
- **A Triage playbook.** `.agents/playbooks/triage.md` extends pstack's investigation playbook. It takes maintainer's duplicate rule, gitcrawl search, Candidate Matrix and full Fit Gate, and sweep.md's domain triage steps 2 to 5. The global run covers every open issue with no current record, including issues whose task has started, and never takes over a started task. `triage fix` replaces investigation's hand-back with Bug fix over the issue's group, a Redesign run when two or more kinds share an owner. Its group starts from the issue a `dup` record names, or the parts a `split` record names. Before the fix it checks live claims (assignees, linked PRs, branches and recent claims) even when the record is current, and Bug fix runs the same check before any public-issue fix. A sweep find gets its record once its issue is published. Each drafted close or repro ask is a file in the run directory written through `pnpm triage mark`, and the page shows the `gh issue comment` command that posts it. A session that cannot record never starts another session to record for it; its reply names each issue and says that `triage #<N>` in a fresh Opus or Sol xhigh session records it. A Codex session runs `pnpm triage` outside the sandbox, because `workspace-write` blocks `ps` and writes to `.git`.
- **maintainer cut to GitHub I/O.** `.agents/rules/maintainer.mdc` keeps issue-draft, slate-issue, prs, security, the queue snapshot, the URL route table, the truth gate, the body-number rule, Reporter Retest Invalidation and Intake. `issues` runs Triage, `queue` takes its udecode/plate issue picks from `pnpm triage queue`, and a udecode/plate issue URL runs Triage. Slate batches keep the snapshot's own issue list, and slate-issue cites triage.md's duplicate rule and Fit Gate without writing a record.
- **Routing.** These send issue triage to the playbook:
  - `AGENTS.md`'s table;
  - `verdict.md`;
  - `bug-fix.md:27`, which reads: "A public `udecode/plate` issue starts with `pnpm triage show <N>`, then the live claim check in the Triage playbook's Fix step 2, even when its record is current. A claim stops the fix as that step says. A current record is its triage. Otherwise run triage's Who records, Method and Record over the issue, then continue here, unless the session comes from a sweep domain run or the show output says this session cannot record; such a session works from the reported repro and never waits for a record. A Slate issue keeps maintainer's slate-issue handoff";
  - `sweep.md` and `issue-harvester.mdc`;
  - `verify.mdc`'s argument hint, which gains `sweep`;
  - `docs/vision/plate.md`'s owner map, which names Triage for issue triage and keeps maintainer for GitHub I/O;
  - `docs/development/agent-skills.md`, which gains a Triage row and a `verify sweep` row.

  The pstack block's playbook list re-renders through sync-pstack.
- **The shared lead reader.** dotai `lead.mjs` keeps a `run_in_background` Bash call open past its immediate result. The call ends when a task notification names its tool call id, which Claude Code records as a user message, a queued-command attachment or a queue operation. It also ends when its output file is gone or ends with Claude Code's exit line, the only trace a TaskStop leaves. An unknown lead row names its miss reason.

## Capabilities

Each capability the change moves, with its old owner and where it lives after.

| Capability | Old owner | After |
| --- | --- | --- |
| Issue drafts from video or text, publish scripts, self-test | maintainer issue-draft | maintainer issue-draft |
| One Slate issue, Slate batches | maintainer slate-issue and queue | maintainer, citing triage.md's duplicate rule and Fit Gate; no register rows |
| PR queue | maintainer prs | maintainer prs, then Babysit |
| Security queue | maintainer security | maintainer security; nothing in the register |
| Issue or PR URL route table | maintainer `<issue-url\|pr-url>` | maintainer: an issue URL runs Triage, a PR URL Babysit, a Slate or security item its own mode |
| Queue snapshot of issues, PRs and advisories, with its export flags | maintainer queue, queue-snapshot.mjs, queue.md | kept; its udecode/plate issue picks come from `pnpm triage queue`, and a Slate snapshot keeps its own issue list |
| Public truth gate, body-number rule | maintainer | maintainer; Triage and Bug fix cite them |
| Reporter Retest Invalidation | maintainer | maintainer for the public correction; the `issue-changed` trigger for the record |
| Intake (issue forms, test tag) | maintainer | maintainer |
| Duplicate rule (two evidence categories), gitcrawl | maintainer issues | triage.md, plus every numbered repro covered, a drafted new issue for each other bug, or `split` |
| Candidate Matrix | maintainer | `pnpm triage queue`, grouped by scope |
| Fit Gate | maintainer | triage.md, whole, with the `not-bug` and `spec` outcomes |
| Bug fix packet | maintainer | bug-fix.md |
| Live claim check before a public-issue fix | maintainer, before its Bug fix handoff | triage.md's Fix step 2, which bug-fix.md runs before reproducing any public udecode/plate issue |
| Domain triage steps 2 to 5 | sweep.md | triage.md; sweep.md keeps step 1, step 6, the miss classes and the roles |
| Kinds table in the round plan | 2026-10-23-sweep-loop.md | register rows; the round 1 table stays as evidence |
| Owner map row for the issue queue | docs/vision/plate.md | docs/vision/plate.md, naming Triage and maintainer |
| Authority Boundaries, Final Handoff | maintainer | AGENTS.md's Messages rule and the plan page |

## Steps

### Phase 1. The register and its helper

Nothing lands before the diff panel. The live proof runs in a disposable clone whose origin is a local bare repository holding the phase 1 commit.

- [x] `tooling/scripts/triage.mjs` with `show`, `queue`, `record` (with `--seen`, `--dry-run` and `--from <batch.tsv>`), `mark`, `labels` and `check`, and `tooling/scripts/triage.test.mjs`. The tests drive the script's command line in a temporary repository with a bare origin, a `gh` stub on `PATH`, fixture `HOME` and `CODEX_HOME` transcripts, and a launch chain of fake processes named `claude`, `codex`, `disclaimer`, `Claude` or `ChatGPT`. Proof: `node --test tooling/scripts/triage.test.mjs` passes, and each case below fails when its line is removed.
  - Refusals: below the floor, above `maxEffort`, a mixed-effort transcript, a below-floor turn before lead.mjs's 512 KiB tail, a continued transcript whose predecessor is below the floor, a missing predecessor, two predecessors, a subagent transcript, a Codex child thread, a nested runtime, a `findLead` miss, tool results that hold the `seen` but not the text (a filtered show, dry-run output, a batch file), a changed `seen`, a failed fetch, a missing floor, a bad row shape and a missing owner path.
  - Must-accept cases: a Claude root session and a Codex root session at xhigh, the Codex one with tool results in Codex 0.163's JSON text, sessions under the desktop app's `Claude` and `disclaimer` processes and under `ChatGPT`, a continued transcript beside a sibling copy of its opening, an issue's text read back in pieces with line numbers and long lines, and an unchanged team draft.
  - States: each of the six stale reasons, a reopen then a close then a second reopen, an edited draft and an outsider's marked comment, every state `unchecked` on refs fetched last, `unchecked` when the ledger is missing, a fork clone that reads `upstream`, a pushing clone with an `upstream` remote that reads `origin`, and the conflict a later record resolves, including the order in which a record made between two landings leaves two heads.
- [x] `docs/triage/issues.tsv` with its header row, `.gitattributes`, the `triage` script in `package.json`, the `triage` key in `.agents/pstack.json` (`repo`, `floor`, `rev`) and a `triage` step in `tooling/scripts/check.mjs`. The step checks shape only, reads the working tree, and refuses a floor above `maxEffort` or a missing `floor` or `rev`. Proof: `pnpm check triage` exits 0 on the register and 1 on a malformed copy; `sync-pstack check` on this worktree keeps the key.
- [x] The live identity proof in a disposable clone whose bare origin holds the phase 1 commit and a copy of `refs/pstack/ledger`. Proof: `show` then `record --dry-run` passes in a fresh Claude Opus xhigh session and a fresh Codex `gpt-6.1-sol @xhigh` session started from the Terminal panel, the Codex one with every `CLAUDE*` variable unset, and in one detached session of each. Each session's process chain goes in its log. It is refused in this session, whose refusal names only the effort cap and the transcripts ad871f2e, 8690af5f and 698b7549, in a `claude -p` session started from this session's shell, for nesting, and in a Codex `gpt-6.1-sol @high` session. Each log goes under the run directory. Codex runs on the owner's own config, which is `danger-full-access`; under `workspace-write` the sandbox blocks `ps` and writes to `.git`, so the helper can neither read the session nor fetch. IDE-extension launches are not covered.

### Phase 2. The method and its routes

- [x] `.agents/playbooks/triage.md`. Proof: `check-playbooks.mjs` passes and `sync-pstack playbook <worktree> triage` prints its investigation base with the deltas applied, the Bug fix continuation included.
- [x] The maintainer cut with `pnpm run prepare`. Proof: every row of Capabilities has a `git grep` hit at its new home, and `sync-resources.mjs --check` passes.
- [x] Routing edits, the Vision owner row and the block re-render through `sync-pstack apply`. Proof: `git grep` finds no route that sends issue triage to maintainer outside `queue` and the URL table, finds the `verify sweep` hint and both agent-skills rows, and `sync-pstack verify` exits 0.
- [x] `docs/plans/topics/proof.md`'s stale handoff line. Proof: the line names the sweep handoff plan and its smoke rounds.
- [x] Smoke. Proof: `sync-pstack smoke` routes `triage`, `triage #5250`, `triage fix #5250`, `maintainer issues` and an issue URL to the Triage playbook, and `review PR 5221` to Babysit, in Claude Code and Codex. A plain-request session for each changed gate, `triage fix` included, loads triage.md, as read from its transcript.

### Phase 3. The shared lead reader in dotai

- [x] `openClaudeCalls` keeps a background call open, and the unknown lead row names its miss. Proof: a dotai test for each fails on the old `lead.mjs` and `decisions-check.mjs` and passes on the new; the lead-miss replay of the 19 local rows still verifies all 19.
- [x] Lesson mode delivery: dotai `validate-skills`, commit, push, sync every managed project. Proof: `sync-pstack verify` exits 0 on plate-2.

### Close

- [x] Land through `land.mjs --check 'pnpm check --affected'`. Proof: the pushed commits on `origin/next`.
- [x] Card the five P0 domain fix runs, which this session owns, through `/chips`, whose card pass cards this session's own Ready tasks: editing t_4b6a74a2, react t_ad6343ea, commands t_cf942036, authored t_eb03327b and media t_e97e42b9. Proof: one `carded` row per task, or an `updated` row naming the task it waits on.
- [x] Hand back the first global triage: the reply names the untriaged count `pnpm triage queue` prints and says that typing `triage` in a fresh Opus or Sol xhigh session starts it, and Open work lists it. Proof: the reply line, the Open work entry and the queue log.

## Completion Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Panel on this plan (owner's "full") | yes | round 1: 13 critical, 12 applied and 1 dismissed; round 2: 9 critical, all applied; round 3: 5 critical, all applied; round 3 is the last before the build |
| Writing passes: deslop and no-comments on code, unslop on prose | yes | deslop fixed a swapped count in the batch-file message and a copied config read; no-comments cut 12 comment lines and rewrote 3; unslop rewrote three sentences in triage.md |
| Panel on the diff (owner's "full") | yes | round 1: 18 critical findings across seats, 11 distinct, all applied; a change to agent instructions and their helpers gets this one round |
| Panel on the dotai lesson diff, the tie-break and the guard | yes | one round: 13 critical findings across seats, 4 distinct; the guard's scratch-push pass reverted, two older guard holes fixed, and one left open with its limit in the guard's header |
| Typed lint on the task's lintable files before the diff panel | yes | 0 warnings and 0 errors on triage.mjs, triage.test.mjs and check.mjs |
| Workflow smoke in both runtimes | yes | every triage prompt loaded triage.md in both runtimes and review PR 5221 went to Babysit; plan mode kept sessions from running `show`, which fetches; outside plan mode, a plain Fix request ran `show` and the live claim check, then went on into the reproduction without a record |
| thermos per slice | skip: the owner's request owes a panel on the diff | skip |
| Hand drive, playtest, plate-docs, best-api, benchmark, changeset | skip: no browser result, public package API, docs page or published package changes | skip |

## Proof

Every command that proves a step runs through `node .agents/pstack/proof.mjs --dir /Users/zbeyens/git/plate-2/docs/plans/artifacts/2026-10-24-triage --name <name> -- <command>`, and the decision row that claims it cites that log. The design's premises were run before this plan, as the synthesis lists: `findLead` inside `node` and `pnpm exec`, per-record effort in the transcript, union merge through a rebase, the gh fields and the ledger's task lookup. Plan panel round 1 added a probe showing a fold replaces a task's `repro:`.

## Reflect

One reviewer read this run's transcript through the judgment, tooling and divergent lenses, and the lead sorted its findings.

Applied in this run:

- The issue tie-break, proposed three times and missing from this plan, was the owner's ask. Within a priority, chips now lists and cards first a task whose repro names a public issue.
- The five sweep P0s waited behind older P0s at the last card pass. This close cards them.

Built, then reverted:

- The push guard denied a push of `next` to a scratch bare repository, a push the Delivery rule never meant to stop. The lead built a pass for a push that reaches none of the project's remotes, and the lesson panel found eight ways a push through it still reaches the project remote. The guard denies every plain push to `next` again. The same round fixed two older holes the panel found and left a third open.

Backlog, each with owner: zbeyens and stop: the owner takes or drops it:

- A guard pass for a scratch push asks git where the push goes, such as with `git ls-remote --get-url`, instead of parsing the command. It still denies a push whose destination a shell expansion or a `cd` hides.

- An approval of "all your suggestions" becomes one quoted todo per suggestion, taken from the replies that made them.
- Before diagnosing a shared helper's bug, check whether dotai already holds an unsynced fix, and whether the reporter's clone synced before the failing data was written.
- A panel brief names the threats the plan's Defaults accept, such as a forged register row, so seats stop asking to harden against them.
- A session that `get_session` cannot find may be live on a teammate's machine, so the board does not take over its tasks.
- Three repeat blocks of one forbidden command class by a hook in one session count as a repeat correction for `/pstack:correct`.

Rejected:

- The Write hook refuses the run directory, and `land.md`'s Worktrees rule already names the shell route.
- Checking a row's evidence against its claim repeats an earlier reflect's Backlog item.
- The Bug fix record gap and the second-machine proof are both in Open work.
- The one-off tool facts about transcripts, background calls, fetch deadlines and the Teach cap need nothing new, because the helpers this run built already handle each.

## Open work

- The first global triage of every open udecode/plate issue. `pnpm triage queue` counts 100 open issues, all untriaged. owner: zbeyens; stop: you type triage in a fresh Opus or Sol xhigh session.
- dotai's guard reads no git config, so an agent's push with no refspec that `remote.<name>.push` or `push.default` sends to the branch passes. guard.mjs's header states that limit; once the guard reads push config, that header sentence goes. owner: the next guard.mjs change in dotai; stop: an agent push that git config sends to next.
- A task whose priority rises because an issue-backed task waits on it does not sort as issue-backed, and a dup merge keeps only the keeper's repro. owner: the next tasks.mjs change in dotai; stop: a 10-card cut that orders a raised or merged task wrongly.
- No session on another person's machine has run `show` and `record` yet, which is the case the owner feared most: another person triaging with a weaker model. owner: zbeyens; stop: natamox's first record or refusal.
- Whether refs/pstack/ledger should stay on the public origin. owner: zbeyens; stop: their call.
- A bot that gh names without a `[bot]` suffix, other than dosubot, github-actions, copilot and claude, counts as a person, so its comment makes a record stale. owner: the next triage.mjs change; stop: a record gone stale on a bot comment.
- A predecessor transcript in another project folder, such as one left by a resume from another directory, is not searched, so `record` refuses that session. owner: the next triage.mjs change; stop: such a refusal.
- IDE-extension launches are not proven to pass the ancestor check. owner: the next triage.mjs change; stop: a refused IDE session.
- A Codex call with no execution record still passes the shared lead reader. owner: the next lead.mjs change in dotai; stop: a repro where it misattributes.
- A forged or hand-written register row passes, and `reviewPaths` skips `docs/**`, so `review.mjs` lists no register change. owner: zbeyens; stop: a forged row found, or a review tier for the register.
- An old worktree whose `lead.mjs` predates the fixes refuses `record` until it rebases. owner: whoever triages there; stop: the refusal.
- A session at the bar can still record a judgment another session made, once it runs `show` itself, and a session an agent starts detached, through the Terminal panel tool or through `start_session`, passes the ancestor check. owner: zbeyens; stop: a record whose judgment came from a weaker session.
- A Codex session resumed into a new rollout file is not followed back to its earlier file. owner: the next triage.mjs change; stop: a Codex transcript that continues another.
- triage.mjs copies land.mjs's choice of the canonical remote, and knows the ref setup.mjs keeps the ledger in. owner: the next dotai helper change; stop: land.mjs or setup.mjs changes either one.
- With no `maxEffort` in `.agents/pstack.json`, `record` applies no effort cap. owner: the next triage.mjs change; stop: a project without `maxEffort` adopts triage.
- A background call whose Claude Code process quit before the call ended keeps an output file with no exit line, so lead.mjs reads it as open while that file stays. owner: the next lead.mjs change in dotai; stop: a lead row misread after a relaunch.
- 13 older calls in dotai's `lead.test.mjs` still go through `claudeInvocationRun`, an export only tests use; this run's two tests go through `lead.mjs`'s main entry. owner: the next lead.mjs change in dotai; stop: that change.
- In the smoke outside plan mode, a plain Fix session on an untriaged issue went on to Reproduce without running `pnpm triage record`, though Bug fix's Before line says to record first. Its 40 turns ran out before it could record later. owner: the next Bug fix playbook change; stop: a second Fix session that reaches Reproduce without a record.
- ellie and plate, the other managed pstack projects, still run v0.9.88 helpers from dotai 89423d0 and f232729, so they get dotai 6206d2c and the tie-break and guard commit only at their next sync, which pushes each one's main branch. owner: zbeyens; stop: your word to sync them.
- Three unknown lead rows from natamox's machine are still undiagnosed. owner: the next lead.mjs change in dotai; stop: a repro on that machine.
