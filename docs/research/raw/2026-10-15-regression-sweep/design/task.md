You are one runner in a parallel design exploration for the Plate repository at /Users/zbeyens/git/plate-2 (branch `next`). Read and report only. Never post, comment, push or change anything outside your own scratch folder. You cannot write project files; return your whole design package as your answer.

First read, in full:

- `/Users/zbeyens/.claude/plugins/cache/pstack-claude/pstack/0.9.84/skills/architect/references/runner-prompt.md`, the discipline every runner follows, and the architect skill it names.
- `/Users/zbeyens/.claude/plugins/cache/pstack-claude/pstack/0.9.84/skills/architect/references/rationale-template.md`, the shape of your answer.
- `/Users/zbeyens/.claude/plugins/cache/pstack-claude/pstack/0.9.84/skills/architect/references/design-red-flags.md`.
- `/Users/zbeyens/git/plate-2/docs/plans/artifacts/2026-10-15-regression-sweep/architect/grounding.md`, the problem, the owner's asks verbatim, the repository conventions, the owners to reuse and the evidence. Then read the files it names that your design depends on.

## The design task

Design the workflow natamox builds so the team can run the owner's P1 to P6 human testing well. The design is a workflow made of agent instructions and the files they read or write; its "types" are the files, their fields and the commands people type. Show the caller's usage first: what natamox and the owner type, in what order, and what each command produces, across one full round of P1 to P5 and its P6 fixes, and the start of the next round.

The design must reach these outcomes. They come from the owner's asks in the grounding, except where marked as the lead's conclusion.

1. Before a round, every page in P1 to P5 has prepared human scenarios: what to do, in which browser or device, what should happen and what must not, aimed at the kinds of bugs agents and their tests have missed before (owner, asks 2 and 3).
2. P1 and P2 compare beta with its reference page and leave out new features, which go to P3 and P4 (owner, ask 1).
3. A tester's find is captured once, in a form an agent can reproduce from, and becomes a public issue only by the existing maintainer route and the user's word (owner, ask 1; `AGENTS.md`).
4. P6 fixes finds one by one with agents, and each fix adds the missing or corrected test at the lowest layer that can see the bug: unit or integration by default, browser only where needed, as for cursor drift (owner, ask 2).
5. The next round knows which scenarios a test now covers and leaves them out, so manual work falls toward zero over rounds (owner, ask 2).
6. Agent-run testing of scenarios is not part of the first version; the design leaves a place for it later (owner, ask 4).
7. The route is consistent with the repository's pstack-based skills and with `verdict`: a thin entry skill, a project playbook over a pstack playbook with anchored deltas, a plan page and a decision log (owner, ask 5).
8. It reuses `verify`, `maintainer`'s issue-draft, the Bug fix playbook and the knowledge tool instead of copying them, and adds no second format for behavior law (lead's conclusion from `workflow-change.md` and the earlier drafts).

Hard constraints: the rules in `AGENTS.md` and `.agents/playbooks/references/workflow-change.md`. The user owns commits on `next`. Nothing posts publicly without the user's word.

## Must-answer questions

Answer each in your design, with evidence from the files where it rests on existing behavior.

1. Which pstack playbook does the project playbook extend, if any, and which steps does it change? Quote the step text you anchor on.
2. What is one scenario: its fields, and the unit it covers (a page, a gesture, a browser or device)? Where does a round's scenario list live, and where does a scenario that survives several rounds live?
3. How are scenarios produced for a page: from what inputs (the reference page, the census of past misses, `verify`'s Scenario Generator axes, the behavior spec), and how does that avoid a full checklist of every gesture on every page?
4. How does a scenario name the test that retires it, and how does the next round find that out without a hand-synced list?
5. How are P1 and P2 page pairs listed, and how are new features routed to P3 and P4?
6. What happens to natamox's draft: which parts survive, which go?
7. How would the first version be tried against the incumbent (the lead preparing checks with `verify`) and the simplest alternative before adoption, as `workflow-change.md` and `.agents/playbooks/plan.md` line 15 require? Name the key and why it is fair.
8. What is the smallest version that still reaches outcomes 1 to 5?

Consider at least one shape that adds no new skill or playbook, using only the existing owners and a round plan, and say why it wins or loses.

## Your answer

Return one design package shaped by the rationale template: Problem, Usage, Shape (the files, each file's sections and fields, the commands), Tradeoffs accepted, Alternatives considered, Open questions and risks, Next implementation step. Answer the must-answer questions inside it, numbered. Keep it under 2,500 words. Do not hedge toward a middle; the differences between runners are the signal.
