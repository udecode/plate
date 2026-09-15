---
name: figure-it-out
description: "Design an evidence-based workflow when no accepted plan or existing playbook fits the requested outcome."
---

# Figure it out

When no accepted plan or existing playbook fits the requested outcome, design one. The deliverable before any code is the workflow itself: a sequence of phases that scales rigor to the task, runs the scientific method, and leaves a decision trail a human can audit after stepping away. Bias toward more rigor. The cost of building the wrong thing dwarfs the cost of being careful.

Don't reinvent a playbook you already have. A focused single-unit task that matches Bug fix, Perf, Feature, Visual parity, Eval, or Multi-phase plan routes there. A large version can reuse the same accepted method across coherent units. Select this skill only when the workflow itself remains unresolved; size, duration or unattended execution alone does not require another method.

## Start

Track the phases below in the existing plan. Read the [Codex runtime adapter](../poteto-mode/references/codex-runtime.md) for applicable tools and authority. Select principle leaves only for an unresolved decision or explicit request.

## Phase A: Frame

Ground first, then commit. Don't start the run until you can state:

- The definition of done as a falsifiable predicate (the **prove-it-works** principle skill). "Done well" has to be checkable.
- Scope, quantified: rough units and effort, plus the blockers grounding surfaced. Raise them before spending hours, not after fifty doomed commits.
- The rigor level, biased high. One-way doors and high blast radius get more; reversible low-stakes steps get less. Rigor is gates and artifacts, not "try harder".

Present the framing and tradeoffs before committing to a long run. Reversible work proceeds (the **never-block-on-the-human** principle skill), use the existing plan for a checkpoint without pausing authorized work.

## Phase B: Design the workflow

Decompose into atomic, independently-landable units. Sequence riskiest-unknown-first so option value stays high. Scaffold and verification come before features (the **foundational-thinking** principle skill).

- Choose the evidence before changing the artifact and capture the relevant baseline. Reuse the owning verifier; build a new harness only when existing proof cannot establish the outcome.
- For one-way-door design decisions, run the **architect** skill (it runs **arena**) with diverse, isolated, opinionated candidates and a read-only judge on a different model family. Skip it for mechanical work whose shape is already concrete. A second arena over a settled design is over-engineering (the **laziness-protocol** principle skill).
- Decide what fans out. Parallelize only across independent work, and give each worker exclusive ownership of its mutable resources (the **separate-before-serializing-shared-state** principle skill). Don't over-fan.
- Write the designed phase list down. That list is what the human reviews.

Then put the design into motion. Add its steps to the todolist as concrete items, after the Phase C entry and before Phase D. Run each under the Phase C loop discipline, and weave the Phase D log through them, a row as each step lands, rather than saving the whole trail for the end.

## Phase C: Run the loop

Each unit is an experiment: state the hypothesis, make the smallest change, measure against the predicate on the real artifact, keep it if it advanced, revert it if it didn't.
Verify each coherent unit before dependent work; group coupled edits by their shared implementation and proof owner.

- Verify by inspecting the artifact, never a self-report. When something passes too easily, suspect the observation method before the system. A blank screenshot passes a lazy gate.
- Inspect delegated artifacts yourself before trusting them; add an independent judge for a requested comparison or consequential unresolved judgment. If a worker games the gate, reset and harden the contract. If the gate itself is wrong, fix the gate in its own change rather than routing around it.
- A verdict is VERIFIED, NOT VERIFIED, or INCONCLUSIVE. Inconclusive is not a pass. Don't hide a negative.

## Phase D: Keep the audit trail

Keep material decisions, outcomes and evidence links in the existing plan. Use **show-me-your-work** for an explicitly requested separate trail or a sequence of competing experiments that needs auditable history. Its complete TSV method remains available. Commit only with actual Git authority. Keep rerunnable evidence so a reviewer can check the result.

## Phase E: Verify and hand back

Check the whole against the Phase A predicate on the real product, not just the harness. Encode any recurring correction as a gate, a lint rule, a check, or a script, so the win can't silently regress (the **encode-lessons-in-structure** principle skill).

**Reply:** the playbook you designed, the rigor level and why, the decision-trail path, what's verified against the predicate, and what's still open.
