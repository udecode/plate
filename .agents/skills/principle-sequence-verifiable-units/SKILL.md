---
name: principle-sequence-verifiable-units
description: "Apply to multi-step work (sweeps, migrations, runs of similar edits) and to how you stack commits and PRs. Break work into small units that each end in a verifiable state, check each before the next, and order delivery so the sequence proves itself to a reviewer."
---

Read the [Codex runtime adapter](../poteto-mode/references/codex-runtime.md) before applying this skill. It maps platform tools and authority; the complete engineering method below remains in force.

# Sequence work into verifiable units

Order work as a sequence of small units, each ending in a state you can check, and don't advance until the current one is green. The same discipline runs at two altitudes, how you execute and how you deliver.

**Why:** A break caught at the unit that caused it is cheap to localize. A break caught after a batch is buried, and you have already built further on a broken base. Sequencing those same units into a delivery a reviewer can replay turns "trust me" into "watch it go red, then green."

**Execution.** In a sweep, migration, or any run of similar edits, verify each change before starting the next. Never batch the edits and verify once at the end. Each unit is a before/after bracket: known-good state, one change, run the check, then proceed. Rebase onto clean trunk first so every check measures against the real baseline. When a lever does the edits, the per-unit check is nearly free; run it anyway.

**Delivery.** Stack commits and PRs in the order that proves the work. The canonical shape is the failing test first, then the fix on top. The first unit shows the bug is real (red), the next shows it resolved (green), so a reviewer sees both the problem and the proof. Other story orders are a subtraction before the reshape, a baseline capture before the treatment, the scaffold before the feature. Each commit lands on its own and the sequence reads as an argument.

**Pattern:**
- Pick the smallest unit that ends in a check: an edit plus its test, or a commit that stands alone.
- Verify before advancing. Red to green per unit, never deferred to a final batch.
- Order the units so the sequence builds confidence on its own, for you while executing and for a reviewer reading the stack.

The sequencing complement to the **prove-it-works** principle skill, which keeps each check real, and the **build-the-lever** principle skill, which makes the per-unit check cheap.
