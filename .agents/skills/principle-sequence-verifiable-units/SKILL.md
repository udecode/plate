---
name: principle-sequence-verifiable-units
description: "Sequence dependent migration or sweep work into coherent units with meaningful verification boundaries."
---

# Sequence work into verifiable units

Order work as a sequence of small units, each ending in a state you can check, and don't advance until the current one is green. The same discipline runs at two altitudes, how you execute and how you deliver.

**Why:** A break caught at the unit that caused it is cheap to localize. A break caught after a batch is buried, and you have already built further on a broken base. Sequencing those same units into a delivery a reviewer can replay turns "trust me" into "watch it go red, then green."

**Execution.** Group coupled edits by their implementation and proof owner. Capture the relevant baseline, complete the coherent unit and run its narrowest meaningful check before dependent work. Independent edits may share proof when one operation establishes every claim. Follow the current checkout and Git policy; a rebase is not a verification prerequisite.

**Delivery.** Stack commits and PRs in the order that proves the work. The canonical shape is the failing test first, then the fix on top. The first unit shows the bug is real (red), the next shows it resolved (green), so a reviewer sees both the problem and the proof. Other story orders are a subtraction before the reshape, a baseline capture before the treatment, the scaffold before the feature. Each commit lands on its own and the sequence reads as an argument.

**Pattern:**
- Pick a coherent unit with a meaningful check: one user operation, caller migration or independently reviewable artifact.
- Verify before dependent work; reuse passed evidence until a relevant change invalidates it.
- Order the units so the sequence builds confidence on its own, for you while executing and for a reviewer reading the stack.

The sequencing complement to the **prove-it-works** principle skill, which keeps each check real, and the **build-the-lever** principle skill, which makes the per-unit check cheap.
