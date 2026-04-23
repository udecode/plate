---
title: Slate public single-op writes should use `Editor.apply(...)` and keep `onChange` behind subscribers
date: 2026-04-19
category: developer-experience
module: slate-v2
problem_type: developer_experience
component: tooling
symptoms:
  - internal helper paths had already moved onto `tx.apply(...)` and `applyOperation(...)`, but public single-op writes still defaulted to wrapped `editor.apply(...)`
  - commit subscribers and `editor.onChange()` still competed for authority over post-commit timing
  - exact interface fixtures kept ambient mutable property reads alive even after explicit accessors existed
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags: [slate, slate-v2, editor-apply, subscribe, onchange, transaction, snapshot-store, compatibility]
---

# Slate public single-op writes should use `Editor.apply(...)` and keep `onChange` behind subscribers

## Problem

The core redesign had already done the hard part:

- `tx.apply(...)` owned transaction writes
- `applyOperation(...)` owned helper/transform writes
- `getSnapshot(...)` and `subscribe(...)` owned the store surface

But the public single-op path still had no explicit stronger seam, so
`editor.apply(...)` kept winning by default.

At the same time, `editor.onChange()` still ran before subscribers, which left a
legacy callback looking more authoritative than the actual commit seam.

That is how compatibility baggage quietly crawls back into the design.

## What Didn't Work

- Treating wrapped `editor.apply(...)` like the public default after the core
  already had a stronger transaction writer
- Letting `editor.onChange()` fire before subscribers, which makes downstream
  ordering depend on callback luck instead of commit truth
- Leaving exact interface fixtures on ambient `editor.children` /
  `editor.selection` reads, which spreads compatibility pressure through tests
  that are not supposed to own it

## Solution

1. Add `Editor.apply(editor, op)` as the explicit public single-op writer.
2. Route that seam through `Editor.withTransaction(editor, tx => tx.apply(op))`
   so it reuses the same transaction/core writer as the rest of the redesign.
3. Keep instance `editor.apply(...)` as compatibility pressure, not the primary
   public write seam.
4. Notify `subscribe(...)` listeners before calling `editor.onChange()`.
5. Move exact `interfaces/Editor/**` fixtures onto explicit read seams:
   - `Editor.getChildren(editor)`
   - `Editor.getSnapshot(editor).selection`
   - `Editor.getSnapshot(editor).marks`

## Why This Works

It lines the public surface up with the real engine ownership:

- public single-op writes hit the transaction seam
- helper/transform writes hit the internal writer seam
- commit consumers anchor to subscribers, not callback timing
- compatibility mirrors stay isolated in deliberate owner files

That makes the core API more honest without pretending the old instance fields
or callbacks vanished overnight.

## Prevention

- When a stronger explicit seam exists, add the public entry point instead of
  letting compatibility instance methods stay the default by inertia.
- Treat `subscribe(...)` as the primary commit seam. `onChange()` is userland
  notification, not commit authority.
- Keep ambient mutable-property reads out of broad fixture trees once explicit
  accessors exist.
- If the remaining compatibility pressure lives mostly in tests and harnesses,
  classify those owner files directly instead of blaming core source forever.
