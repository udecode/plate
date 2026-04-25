---
title: Spec Spies Must Be Restored Or Full Suite Order Breaks
type: solution
date: 2026-03-24
status: completed
category: test-failures
---

# Spec Spies Must Be Restored Or Full Suite Order Breaks

## Problem

Fresh repo coverage failed even though the local target specs were green.

The root cause was leaked Bun spies in two specs:

- [BaseCodeBlockPlugin.spec.ts](packages/code-block/src/lib/BaseCodeBlockPlugin.spec.ts)
- [withApplyTable.spec.ts](packages/table/src/lib/withApplyTable.spec.ts)

Those spies survived past their own tests and changed later test behavior depending on suite order.

## Fix

- Add `afterEach(() => mock.restore())` to specs that spy on shared module functions.
- If a spec expects a module spy to exist, create that spy in `beforeEach` instead of relying on leaked state from an earlier test.

## Rule

If a spec uses Bun `spyOn` or `mock.module`, restore or reset it in the same file.

If a spec only passes when run alone or only fails in full coverage, suspect leaked spy state before blaming product code.
