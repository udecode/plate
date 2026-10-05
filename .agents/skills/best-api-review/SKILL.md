---
description: Reconcile earlier reviews, then judge whether a Plate or Plite API or architecture direction earns further work before detailed design or implementation, and record the verdict in the review ledger.
argument-hint: '[next | audit <scope> | <proposal, path or plan>]'
name: best-api-review
metadata:
  skiller:
    source: .agents/rules/best-api-review.mdc
---

# Best API Review

Handle $ARGUMENTS.

Decide whether further work is justified. Run the API review playbook, `.agents/playbooks/api-review.md`: it picks the item, reconciles earlier reviews, compares the design space with the `best-api` lens, gives one verdict and records it. Agreement is not the default, and "keep the current design; this change adds no material value" is a successful review. Use `audit <scope>` when every candidate in a bounded set needs a verdict.

| Verdict | Meaning | End of this review |
| --- | --- | --- |
| **Stop** | No material benefit, unjustified machinery, a violated hard constraint, or it loses to the current design. | State why and keep the current design. No plan, task or consolation backlog. |
| **Pursue** | Evidence supports a material problem and a better direction, which may replace the proposal. | Name the single next owner, and continue into the Plan playbook when it is that owner. |
| **Defer** | A named evidence gap or external prerequisite can change the verdict. | State what would settle it and recommend only that investigation. |

Missing evidence alone is not Stop, and an API that does not exist yet is design work, not an evidence gap.

A previous verdict is evidence, not law. Changed requirements, contradictory evidence, source changes or a materially better argument reopen it at the question level: a paint defect does not reopen settled topology or resize decisions. A Pursue whose target already landed is recorded as a Stop, with the landed work as evidence.

**Never leave a record pending.** This holds for review and execution records alike. `record` refuses only for the record's own contract, and its message names the fix; fix the draft and record again in the same run. Name an unfinished draft's path in the reply and in the plan's decision log, so a later session finishes the record if this one ends.
