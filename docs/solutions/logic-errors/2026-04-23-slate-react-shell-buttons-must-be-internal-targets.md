---
title: Slate React shell buttons must be internal targets
date: 2026-04-23
category: docs/solutions/logic-errors
module: Slate v2 slate-react large document runtime
problem_type: logic_error
component: testing_framework
symptoms:
  - Generated shell activation gauntlet reported `command cannot be native-owned`.
  - Shell activation worked in a hand-authored row but failed the kernel transition check.
  - A contenteditable=false shell button keydown bubbled into Editable as an editor-native command.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, shell, kernel, large-doc, accessibility]
---

# Slate React shell buttons must be internal targets

## Problem

Large-document shell buttons are app/internal controls. If their keydown events
bubble into `Editable` as editor events, the kernel can classify shell
activation as a native-owned editor command.

## Symptoms

- A generated shell activation gauntlet failed with `command cannot be native-owned`.
- The hand-authored shell activation row still passed because it asserted the
  final selection, not the kernel transition.
- The failure appeared only after generated gauntlets started checking illegal
  transitions.

## What Didn't Work

- Treating the hand-authored row as sufficient. It proved behavior, not
  ownership.
- Asserting DOM selection for shell activation. Shell activation is model-backed
  and intentionally does not rely on DOM focus selection.

## Solution

Treat role-button and `contenteditable=false` descendants as internal targets in
the editable input classifier.

Generated shell activation proofs should assert model selection through the
Slate browser handle, not DOM selection.

## Why This Works

Shell activation belongs to the shell control, not the editor native input
path. Classifying shell controls as internal targets prevents `Editable` from
recording a command while also marking the event as native-owned.

## Prevention

- Generated gauntlets should check illegal kernel transitions, not just final
  model state.
- Shell-backed selection proofs should say whether they assert model selection
  or DOM selection.
- Any contenteditable=false interactive descendant should be reviewed as an
  internal target before adding editor-level key handling.

## Related Issues

- [Slate browser selectionchange proof must separate traceability from programmatic import](../test-failures/2026-04-22-slate-browser-selectionchange-proof-must-separate-traceability-from-programmatic-import.md)
