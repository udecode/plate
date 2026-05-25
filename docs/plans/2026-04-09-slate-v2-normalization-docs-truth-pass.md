---
date: 2026-04-09
topic: slate-v2-normalization-docs-truth-pass
status: completed
---

# Slate v2 Normalization Docs Truth Pass

## Goal

Stop the normalization docs from implying full legacy built-in constraint parity
when that family is still an open risky lane in `slate-v2`.

## Completed

- updated `docs/concepts/11-normalizing.md` to distinguish:
  - the real current custom normalization seam
  - the still-open built-in normalization parity family
- updated `docs/concepts/02-nodes.md` to remove the implied guarantee that
  inline spacing is automatically restored by built-in normalization

## Verification

- targeted grep over the touched docs for the new normalization warning language
- `yarn lint:typescript`
