---
name: autoclosure
description: "Take an existing pull request or local candidate from candid assessment through authorized repair, cleanup, proof, and an honest merge-ready handoff. Use when asked to perfect, finish, or fully close a candidate; use review skills for read-only feedback, PR monitoring for status-only work, and shipping for merge-only work."
metadata:
  source: udecode/dotai
  source-path: skills/autoclosure
---

# Autoclosure

Use [Task](../task/SKILL.md) as the lifecycle and the current project's
technical, verification, and delivery owners. Autoclosure names the complete
pull request closure operation. It is not a second task controller or review
budget.

Resolve the exact candidate and establish whether it is present in the
authorized checkout. Read the actual pull request or source artifact when
available. Invocation requests in-scope local assessment and repair unless the
user made the task read-only. It does not grant commit, push, comment, merge,
release, or deployment authority.

Start with a candid verdict. Challenge whether the candidate should exist and
state the strongest materially justified cut. Use the relevant design-review
owner only when an unsettled API or architecture decision changes that verdict.

For a candidate worth pursuing, continue through its real owners until:

- accepted requirements and blocking findings are resolved;
- affected callers, code shape, documentation, examples, generated output,
  release artifacts, and temporary work are coherent;
- focused proof passes on the actual final candidate;
- every remaining gap has an owner and prevents a merge-ready claim when it is
  material.

Reuse Task's plan, goal, review budget, verification, and delivery rules. Do
not add another controller, mandatory panel, clean-pass count, template, or
publication step. When only continuous integration, merge conflicts, or review
threads remain, use the project's pull request monitoring owner only when the
user asked to drive that state.

Report the verdict, repairs kept, findings rejected with reasons, proof,
residual risks, and exact local, committed, pushed, and pull request states.
Call the remote pull request merge-ready only when its final published ref,
required checks, reviews, and mergeability were actually read back.
