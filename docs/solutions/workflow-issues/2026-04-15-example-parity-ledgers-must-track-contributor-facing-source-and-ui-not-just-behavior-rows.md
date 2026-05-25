---
title: Example parity ledgers must track contributor-facing source and UI, not just behavior rows
date: 2026-04-15
category: workflow-issues
module: slate-v2
problem_type: workflow_issue
component: documentation
symptoms:
  - Example parity rows were marked closed even though the current same-path pages had visibly drifted from legacy
  - Narrow replacement-compatibility proof like tokenization or typing was being treated as full example recovery
  - Same-path current files were rewritten from scratch without the ledger reopening the row
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: high
tags: [slate-v2, example-parity, replacement-compatibility, contributor-facing, drift-ledger]
---

# Example parity ledgers must track contributor-facing source and UI, not just behavior rows

## Problem

The example parity matrix was overclaiming closure.
Rows were being treated as recovered once a current + legacy proof lane existed,
even when the contributor-facing example had drifted far away from legacy.

## Symptoms

- `code-highlighting` was recorded as a paired parity row even though the
  current page had dropped the legacy toolbar/code-block insertion flow and
  reduced the language surface.
- Other same-path examples like `richtext`, `inlines`, `images`, and
  `search-highlighting` had green behavior proof while still exposing clearly
  different control chrome or source shape.
- The ledger gave no explicit read for source parity or UI parity, so scratch
  rewrites could hide behind one narrow green row.

## What Didn't Work

- Treating same-path current files as ambient closure.
- Treating replacement-compatibility as if it proved full contributor-facing
  example parity.
- Using one coarse matrix status like `paired parity row` without saying what
  was actually proved.

## Solution

Reopen the matrix around the thing users actually see.

1. Keep behavior proof, but stop pretending it proves the full example.
2. Add an explicit source/UI audit pass for same-path examples.
3. Reopen rows where the current example drifted materially from legacy even if
   a narrow behavior row stayed green.
4. Set a harder default:
   same-path recovery should start from the closest legacy source structure and
   contributor-facing chrome that the current runtime can honestly support.

That landed in:

- [example-parity-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/example-parity-matrix.md)
- [2026-04-15-slate-v2-example-parity-recovery-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-15-slate-v2-example-parity-recovery-plan.md)

The reopened example rows from the audit were:

- `code-highlighting`
- `editable-voids`
- `embeds`
- `hovering-toolbar`
- `iframe`
- `images`
- `inlines`
- `mentions`
- `paste-html`
- `richtext`
- `search-highlighting`

## Why This Works

Behavior parity and contributor-facing example parity are different claims.

A green row for tokenization, selection, typing, or scrolling only proves that
one seam.
It does **not** prove that the example page still mirrors the legacy source,
copy, control density, or interaction model.

By recording source/UI drift explicitly, the ledger stops lying while keeping
the useful narrower proof lanes.

## Prevention

- Never upgrade an example row to recovered just because one current + legacy
  behavior lane is green.
- For every same-path legacy example, record both:
  - what behavior proof exists
  - whether the contributor-facing example still reads close to legacy
- If the current page is a scratch rewrite, generic surface wrapper, or visibly
  different control shell, reopen the row until that divergence is justified.
- Default recovery to closest legacy source first. Justify rewrites second.

## Related Issues

- [2026-04-14-slate-direct-audit-green-does-not-mean-mirrored-if-harness-shapes-output.md](/Users/zbeyens/git/plate-2/docs/solutions/workflow-issues/2026-04-14-slate-direct-audit-green-does-not-mean-mirrored-if-harness-shapes-output.md)
- [example-parity-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/example-parity-matrix.md)
