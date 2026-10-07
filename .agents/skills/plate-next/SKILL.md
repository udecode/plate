---
description: Review a live Plate package, file or API path against the Plate v2 target, or sync one or every live package by repairing its review findings.
argument-hint: '[sync [package] | <package, file or API path>]'
name: plate-next
metadata:
  skiller:
    source: .agents/rules/plate-next.mdc
---

# Plate Next

Handle $ARGUMENTS.

Run the Refactoring playbook's Package review and sync section (`.agents/playbooks/refactoring.md`) in full. The Plate v2 target is a clean Plate product layer on top of Plite, with no old Slate or Plate compatibility left in the final API; `VISION.md`, `docs/vision/plate.md` and `docs/vision/plite.md` hold its law.
