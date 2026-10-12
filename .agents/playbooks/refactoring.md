---
extends: refactoring
when: Use it to audit or simplify Plate code ownership, such as "clean up <code surface>", "simplify <package>" or a structural audit that deletes, merges, inlines or splits code; retiring docs goes to `research` instead.
---

# refactoring

- **Before** "Pin the behavior contract first": establish read-only audit versus authorized implementation. A timebox grants no mutation authority. Inventory the bounded owner, consumers, public contracts and proof before choosing a cleanup.
- **In** "Name the target shape": split only for durable behavior or proof ownership with lower navigation cost. File size alone does not justify a split.
- **In** "Move in small behavior-preserving steps": the lead edits. Each packet preserves behavior and has a focused proof and keep/revert decision. Public API or UX changes return to the Plan playbook. Runtime scaling changes load `benchmark` first.
- **Replace** "Rebase into small ordered commits": follow project Delivery after verification.

## Package review and sync

For `plate-next`, enumerate the requested live package or every package when all are named. Read exports, implementation owners, materially different consumers, tests and docs. Review reports findings; sync repairs accepted findings through the owning skills. Preserve current Slate-based contracts and require concrete user, API or docs value.
