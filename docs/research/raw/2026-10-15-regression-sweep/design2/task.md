You are one runner in a parallel design exploration for the Plate repository at /Users/zbeyens/git/plate-2 (branch `next`). Read and report only. Never post, comment, push or change anything outside your own scratch folder. You cannot write project files; return your whole design package as your answer.

First read, in full:

- `/Users/zbeyens/.claude/plugins/cache/pstack-claude/pstack/0.9.84/skills/architect/references/runner-prompt.md`, the discipline every runner follows, and the architect skill it names.
- `/Users/zbeyens/.claude/plugins/cache/pstack-claude/pstack/0.9.84/skills/architect/references/rationale-template.md`, the shape of your answer.
- `/Users/zbeyens/.claude/plugins/cache/pstack-claude/pstack/0.9.84/skills/architect/references/design-red-flags.md`.
- `/Users/zbeyens/git/plate-2/docs/plans/artifacts/2026-10-15-regression-sweep/architect2/grounding.md`, then the files it names that your design depends on, the two trial keys included.

## The design task

Design what a tester does on each page during a hands-on round, and how a round prepares and records that work, so that the owner's P1 to P5 hand pass finds bugs that tests and agents missed, and so that hand time shrinks over rounds. Three trials found that cards an agent writes ahead of a round contained a held-out bug's exact actions once in 60 chances. Treat that as the problem to solve, not a detail.

Show the caller's usage first: what natamox does on one P1 page and one P2 page in round 1, what the round's plan holds before and after, and what round 2 holds for those pages.

Outcomes, each from the owner's asks in the first grounding file unless marked:

1. A round spends the tester's two days where unknown bugs are likely, aimed at the kinds of bugs agents and their tests missed (owner, asks 1 and 3).
2. P1 and P2 compare beta with its reference page; new features go to P3 and P4 (owner, ask 2).
3. Every find is recorded once, reproducibly, and becomes an issue, then a fix with a test at the lowest layer that sees it (owner, asks 1 and 3).
4. Hand time falls over rounds by a rule the next round can apply without judgment calls (owner, ask 3).
5. Round 1 can tell whether the pass works, with a key or measure that is fair (lead's conclusion from `.agents/playbooks/references/workflow-change.md:7`).
6. It reuses `verify`, issue-draft, Bug fix and the knowledge tool, and adds the fewest new files and concepts (owner, ask 5; lead's conclusion from the trials).

## Must-answer questions

1. What is the unit of a tester's work on a page, and what does it hold? Why would it catch bugs like the two keys' entries when five prepared cards did not?
2. How is a page's time set, and how does it change between rounds?
3. What role, if any, do prepared checks keep, and for which bugs?
4. How does the census's list of kinds of miss reach the tester, if at all, given that aiming cards by it did not help in either picking trial?
5. How is a find recorded so an agent can reproduce it, and what does the next round keep from it?
6. How does round 1 measure whether the pass works? Name the key or measure, who builds it, and why the lead cannot bias it.
7. What is the smallest version that reaches outcomes 1 to 5?

Consider at least one shape that keeps prepared cards as the main unit and say why it wins or loses against the trial evidence.

## Your answer

Return one design package shaped by the rationale template: Problem, Usage, Shape (the files, each file's sections and fields, the commands), Tradeoffs accepted, Alternatives considered, Open questions and risks, Next implementation step. Answer the must-answer questions inside it, numbered. Keep it under 2,000 words. Do not hedge toward a middle; the differences between runners are the signal.
