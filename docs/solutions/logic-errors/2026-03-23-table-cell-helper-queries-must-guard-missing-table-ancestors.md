---
title: Table cell helper queries must guard missing table ancestors
category: logic-errors
date: 2026-03-23
tags:
  - table
  - queries
  - coverage
  - helpers
---

# Table cell helper queries must guard missing table ancestors

## Problem

Direct helper coverage for `getTableCellBorders(...)` and `getTableCellSize(...)` exposed a bad assumption in the table query layer.

If a `td` node existed outside a full `table > tr > td` chain, both helpers could throw while walking parent entries instead of falling back safely.

## Root Cause

Both helpers assumed that once a cell parent existed, the next parent lookup would always return a real table row or table node.

That is fine for ideal editor state, but too brittle for direct helper use, partial trees, or malformed intermediate structures.

## Solution

Guard the parent lookups before reading row or table data.

For `getTableCellBorders(...)`:

- if the row parent is missing, return default bottom/right borders
- if the table parent is missing, return the same safe fallback

For `getTableCellSize(...)`:

- if the cell does not have a real `tr` parent, return `{ minHeight: 0, width: 0 }`
- if the row exists but the table does not, keep the resolved row height and return width `0`

## Prevention

- Keep one direct helper spec for table query utilities, not only transform-level coverage.
- Any helper that climbs `cell -> row -> table` should treat each step as optional unless the function contract explicitly says malformed trees are invalid.
- When the fallback behavior is cheap and deterministic, prefer guarding over crashing.
