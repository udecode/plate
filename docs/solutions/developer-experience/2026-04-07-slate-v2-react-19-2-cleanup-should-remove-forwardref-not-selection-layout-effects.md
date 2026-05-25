---
title: Slate v2 React 19.2 cleanup should remove forwardRef, not selection layout effects
date: 2026-04-07
category: docs/solutions/developer-experience
module: slate-v2 react runtime
problem_type: best_practice
component: frontend_stimulus
symptoms:
  - "The repo still carried React 18-era forwardRef wrappers and one-shot useMemo constructors after the React 19.2 convergence work."
  - "A blanket 'modern React cleanup' risked deleting layout effects and memoization that still earn their keep."
root_cause: incomplete_setup
resolution_type: code_fix
severity: medium
tags:
  - slate-v2
  - slate-react-v2
  - react-19
  - forwardref
  - refs
  - layout-effects
  - memo
---

# Slate v2 React 19.2 cleanup should remove forwardRef, not selection layout effects

## Problem

After the React 19.2 convergence slice, parts of `slate-react` still used
React 18-era `forwardRef` wrappers, `ref as any`, and one-shot `useMemo`
construction.

That made the runtime posture inconsistent.

The trap was assuming every old-looking React pattern should be deleted in the
same pass.

## Solution

Clean up the actual compatibility debt:

- replace `forwardRef` wrappers with plain React 19 ref props
- remove `memo(forwardRef(...))` wrappers when they are just structural noise
- replace one-shot `useMemo(() => createEditor(), [])` with lazy `useState`

Do **not** delete the patterns that still earn their keep:

- selection-sync `useLayoutEffect` in `Editable`
- benchmark-backed `React.memo(...)` on `EditableDescendantNode`

## Why This Works

React 19.2 cleanup is about removing compatibility scaffolding, not about
flattening every advanced pattern into the same style.

`forwardRef` and fake constructor `useMemo` are historical baggage here.

`useLayoutEffect` and the descendant memo wall are not. They still defend real
correctness and performance seams.

## Reusable Rule

For React 19-only cleanup in `slate-v2`:

- kill `forwardRef`
- kill `ref as any`
- kill one-shot constructor `useMemo`
- keep layout effects that synchronize DOM selection before paint
- keep memoization that is already benchmark-backed
