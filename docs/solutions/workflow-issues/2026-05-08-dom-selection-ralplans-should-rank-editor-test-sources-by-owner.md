---
title: DOM Selection Ralplans Should Rank Editor Test Sources By Owner
date: 2026-05-08
category: docs/solutions/workflow-issues
module: slate-v2-ralplan
problem_type: workflow_issue
component: development_workflow
symptoms:
  - Ecosystem research can flatten Lexical, ProseMirror, and Tiptap into one vague test-theft bucket.
  - DOM selection plans can accidentally copy framework APIs instead of portable behavior invariants.
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: low
tags: [slate-v2, ralplan, dom-selection, test-harvest, ecosystem]
---

# DOM Selection Ralplans Should Rank Editor Test Sources By Owner

## Problem

DOM selection planning gets sloppy when every editor test corpus is treated as
equally authoritative. Lexical, ProseMirror, and Tiptap are useful for different
reasons.

## Symptoms

- The plan says "steal ecosystem tests" without naming exact source rows.
- Tiptap command tests start looking like Slate API proposals.
- IME, clipboard, table, focus, and DOM bridge rows get mixed into one lane.

## What Didn't Work

- Using the Lexical harvest alone: good browser-regression style, but not the
  deepest DOM selection architecture evidence.
- Treating Tiptap as an architecture source: useful focus timing pressure, but
  mostly ProseMirror command wrapping and product/demo tests.
- Copying ProseMirror shape wholesale: its view-desc and integer position model
  are not Slate's model.

## Solution

Rank sources by the owner they actually prove:

- ProseMirror `view/test/webtest-selection.ts` is the primary source for DOM
  selection import/export, coordinates, fallback, BR-hack, and selectable-node
  movement invariants.
- Lexical harvest reports are the primary source for browser-first regression
  shape, honest transport, explicit skip reasons, and mobile/table deferrals.
- Tiptap `focus.ts` is pressure for focus timing only: mobile direct focus,
  Safari `preventScroll`, and React RAF. It does not justify copying Tiptap's
  command API into Slate.

Then classify each row as `steal`, `reject`, or `defer`, with a Slate owner:
`slate-dom`, `slate-react`, `slate` core, or another lane.

## Why This Works

It preserves the portable behavior invariant without importing another editor's
framework shape. The source ranking also prevents closure lies: jsdom renderer
composition does not prove mobile IME, clipboard transform tests do not prove a
DOM selection bridge, and whole-table selection does not become a raw Slate
requirement just because Lexical owns it.

## Prevention

- In DOM selection ralplans, read ProseMirror selection tests before Tiptap
  demos.
- Use Lexical harvests to shape browser proof and skip discipline.
- Keep Tiptap evidence narrow unless the source is a browser behavior file.
- Every copied test row needs: source path, behavior invariant, Slate owner,
  action, and verification route.

## Related Issues

- `docs/plans/2026-05-08-slate-v2-dom-selection-focus-bridge-ralplan.md`
- `docs/editor-test-harvester/lexical/report.md`
- `docs/solutions/test-failures/2026-04-22-slate-browser-selectionchange-proof-must-separate-traceability-from-programmatic-import.md`
- `docs/solutions/logic-errors/2026-05-06-slate-react-foreign-dom-selections-must-be-ignored-before-import.md`
