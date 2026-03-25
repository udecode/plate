---
title: Warning-path React specs should capture debug.warn in their harness
type: solution
date: 2026-03-25
status: completed
category: test-failures
---

# Warning-path React specs should capture debug.warn in their harness

## Problem

A broad Bun run was green, but [useElementStore.spec.tsx](/Users/zbeyens/git/plate/packages/core/src/react/stores/element/useElementStore.spec.tsx) sprayed a wall of `USE_ELEMENT_CONTEXT` warnings into the output.

The spec intentionally rendered consumers outside `ElementProvider`, so the warnings were expected behavior. The noisy part was the test harness, not the runtime code.

## Fix

Override the core debug plugin in the spec harness and replace `logger.warn` with a no-op for that test editor:

- use [DebugPlugin.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/debug/DebugPlugin.ts)
- configure `logger.warn`
- keep the runtime warning path intact

## Rule

If a React spec intentionally hits a warning path, capture `debug.warn` in the spec harness.

Do not mute the runtime globally and do not leave expected warnings spamming broad Bun runs.
