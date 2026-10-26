# Review desk: triage, domains and teammates

Status: planning, waiting on your go to build phase 5
Topic: review-desk
Playbook: plan

## Brief

### What will change?

The desk gets a Domains view built from the triage register, spec questions in Decisions, triage cards on a session, a badge when a formal check's baseline grows, and real titles for natamox's sessions.

### What could go wrong?

The desk shows triage's last call, not whether it is still current, so an issue can look open after its owner code moved. The triage queue stays the judge of that.

## Teach

Since the desk's last change you ran triage over 101 open issues, a domain sweep with natamox, a research loop and two formal checks. Each lands as commits, so the desk lists them. But it shows them only as raw diffs of a register file and of plan tables, and natamox's sessions show as bare ids.

The triage register already holds what a fixer needs. Each issue's newest record names its outcome, its domain, its priority, the code that owns the bug and why. Today you read that by opening the register in the diff.

Phase 5 reads the register as data, like the chips ledger. A Domains view groups the open issues by domain, worst first. Each issue opens as a card beside the landings that recorded it and the fix-run chip that names it.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Whether a triage call is current | The desk shows the register's newest call per issue and leaves freshness to the triage queue, which reads GitHub (look) | The desk also shows each call's freshness | show freshness | big |
| Research | No research view, because compile batches are written for agents and you act on research through verdicts and chips, which the desk already shows (look) | A Research view of areas, their pages and saved repos | research view | big |
| Sweep kind numbers | Issues show without their sweep kind numbers, because each issue's record already holds its domain and priority | Each issue also shows its round 1 kind number | sweep kinds | small |
| Daily check | No daily check panel, because each failure it finds already arrives as a chip | A header line with the last daily check's result | daily check | small |
| Baseline growth | A landing that adds entries to either formal check's baseline gets a badge and counts as left until you accept it, because accepting new coupled behavior is your call | A badge only, with no effect on what is left | badge only | small |
| Teammates' sessions | A session with no file on this Mac takes its plan's title, or its first landing's subject, and shows its author | Bare session ids, as today | session ids | detail |
| Where phase 5 builds | In this session, fast, with no panel, like phases 2 to 4 | A fresh session per step | new session | detail |

## Outcome

You review triage and domain work as issues and domains, not as register lines. You see which domains still hold P0 and P1 issues, which chip fixes them, and which of your specs wait on you. A landing that widens a formal check's baseline asks for your accept. natamox's sessions read as theirs.

## Scope

In scope: the review-desk skill repository's app, and Plate's desk file for the baseline paths. Out of scope: research, the sweep's kind tables, the daily check, other repositories, and any change to triage's own scripts.

## Decisions

- The desk reads the triage register at the trunk tip through git, as data, the way it reads plans. It runs none of triage's code, because the register's columns are the stable contract and the desk's rule is to run no repository code but the page renderer.
- An issue's current record is the head of its `prev` chain. Two heads show as a conflict, which is triage's own word for it.
- A landing belongs to an issue when its diff adds one of the issue's record ids to the register. The record's `read` column names the commit triage read, not the landing, so it cannot link them.
- A chip belongs to an issue when its offer names `plate#<number>`, which is how round 1's fix-run chips cite issues.
- Baseline growth counts the identity strings in the JSON before and after the landing, so a reordered file counts zero.

## Steps

- [ ] 5.1 Name teammates' sessions. A session with no session file on this Mac shows its plan's title, or else its first landing's subject, with its commit author as a label. Proof: a `node --test` case with a landing by another author and no session file, which fails on the current reader, and by hand on your desk natamox's sessions `local_3cc6e510` and `local_ea702558` show titles and the natamox label.
- [ ] 5.2 Add the Domains view. It lists each domain of the register's current `kind` records, by highest priority then count, with its P0, P1 and P2 counts. Each domain expands to its issues, and needs-repro, spec, duplicate, split, not-bug and fixed records sit in groups below the domains. An issue opens the landings that added its records and, in the right pane, its card: outcome, priority, domain, owner code links at the commit triage read, cause, miss, why, who and which model, its earlier records, its GitHub link and the chips that name it. Proof: `node --test` cases for the head of a `prev` chain, two heads as a conflict, the domain order and the landing match, each failing before the change, and by hand on your desk the view lists 32 domains over the 89 current kind records, with the 12 P0 issues' domains first, in light and dark at 1,440 and 1,024 pixels.
- [ ] 5.3 Put spec questions in Decisions. Each current `spec` record lists under Decisions as a spec question that opens its issue card. Proof: a `node --test` case, and by hand the six spec records listed.
- [ ] 5.4 Show a session's triage records. The closed section under a session's document lists each register record its landings add, as the same cards. Proof: a `node --test` case, and by hand the triage session's 103 records across its four record landings.
- [ ] 5.5 Badge baseline growth. The desk file gains a baselines entry naming the authored decision order and autoformat input rules baselines. A landing that adds entries shows `baseline +N` and stays left until accepted; one that only removes entries shows `baseline −N` as a note. Proof: a `node --test` case on a fixture repository that grows, shrinks and reorders a baseline, and by hand on your desk the counts on the five landings that changed the authored baseline and the one that changed the autoformat baseline, checked against a count from git.
- [ ] 5.6 Phase exit. Proof: every node test and both type checks pass on the final bytes, one hand drive covers steps 5.1 to 5.5 on your desk, and the skill's SKILL.md names the new view and badge.

## Proof

Node tests and both type checks in the skill repository prove the readers and the selection logic. Your desk on port 48650 proves what you see, by hand in the built-in browser, because the desk has no scripted browser tests, as you asked. Counts on the desk are checked against counts taken from the register and from git.

## Open work

- The review of phases 2 to 4 and every fix since, on your "full". Owner: you. Stop: before "push dotai".
- The 111 sessions left on your desk today, mostly bug fixes. Owner: you. Stop: none.
