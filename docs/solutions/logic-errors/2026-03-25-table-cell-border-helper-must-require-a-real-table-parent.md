---
title: Table cell border helper must require a real table parent
type: solution
date: 2026-03-25
status: completed
category: logic-errors
module: table
tags:
  - table
  - queries
  - malformed-input
  - tests
---

# Problem

`getTableCellBorders` only checked that a row had some parent node.

That let malformed trees treat any ancestor as the table, so the helper could invent `top` and `left` edge borders even when the cell was not actually inside a table.

# Fix

- Resolve the row parent as before.
- Require the next ancestor to have the real table type before treating it as the table.
- Fall back to the default bottom and right borders when the table ancestor is missing or wrong.

# Rule

Helpers that walk structural ancestors should validate node type, not just node existence.

Otherwise malformed trees quietly look valid and helper output lies.
