---
date: 2026-04-03
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Slate v2 clipboard proof must split fragment semantics from DOM transport
tags:
  - slate-v2
  - slate-dom-v2
  - clipboard
  - fragment
  - architecture
severity: medium
---

# Slate v2 clipboard proof must split fragment semantics from DOM transport

## What happened

While landing the `slate-v2` clipboard-boundary proof, the first few attempts kept failing architect review for the same reason:

- the plan or code treated clipboard as mostly a DOM transport problem
- but the real missing seam was partly in `slate-v2` itself

The proof only became stable after the boundary was split explicitly:

- `slate-v2` owns fragment meaning:
  - `Editor.getFragment(editor)`
  - `Transforms.insertFragment(editor, fragment, options?)`
- `slate-dom-v2` owns browser transport:
  - MIME keys
  - `DataTransfer`
  - HTML scraping
  - plain-text export/fallback
  - payload provenance/version envelope checks

## Why this mattered

If DOM transport owns fragment meaning, the browser layer starts deciding what the editor document is.

If core owns MIME/HTML transport, the engine starts swallowing browser junk.

That blur already existed in legacy Slate across:

- core fragment extraction
- DOM clipboard write/read helpers
- React event wiring
- downstream `getFragment` / `insertFragment` overrides

The proof stayed honest only after that blur was made explicit and then reduced.

## What fixed it

1. Pin one narrow core seam first.
2. Keep DOM transport outside core.
3. Use a versioned clipboard namespace for the v2 proof instead of reusing the legacy one.
4. Make unsupported payloads and unsupported copy/paste targets fail closed instead of throwing.
5. Keep the proof subset narrow and explicit:
   top-level blocks with one text child, ordinary text/block paste targets.

## Reusable rule

For editor clipboard architecture:

- core decides fragment meaning
- DOM decides browser transport
- React only delegates

If a clipboard proof cannot state those three lines cleanly, it is not done.
