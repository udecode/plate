---
description: Judge any doc, draft, issue, PR, idea, or Plate/Plite review scope id (Stop/Pursue/Defer) with pushback, outcomes, and open questions. Also handles `/loop verdict <scope>`, `explore <scope or idea>` (rounds until `lock`), `audit`, and `audit restart`.
argument-hint: '[<doc, draft, issue, PR or idea> | <scope id> | explore <scope or idea> | audit | audit restart | audit <scope or group id>]'
name: verdict
metadata:
  skiller:
    source: .agents/rules/verdict.mdc
---

# Verdict

Handle $ARGUMENTS.

Run `.agents/playbooks/verdict.md` in full: load `pstack:poteto-mode` first, run `check-playbooks.mjs` per `AGENTS.md`, and follow the extended pstack playbook with the Verdict deltas. Paths routes intake, Explore (goal restate + owner-steered rounds until `lock`), bare `audit`/`audit restart`, or the deep path (reconcile history, run a Redesign from First Principles + HHF `best-api` Hard-cut pass against other editors, rank lanes by lasting architectural and user value without discounting for blast radius or single-session convenience, run the convergence audit loop until a pass finds 0 new material gaps, and write `Stop`, `Pursue`, or `Defer` to frontmatter). Title the session first and list out-of-scope work in Open work.
