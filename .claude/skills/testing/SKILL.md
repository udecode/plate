---
name: testing
description: >-
  Testing strategy and conventions for Plate packages using Bun as the test
  runner. Covers three-layer test architecture (unit, contract, golden I/O),
  seam selection (createEditor vs createSlateEditor vs createPlateEditor), file
  organization, fixture patterns, and cleanup heuristics. Use when writing,
  reviewing, or refactoring tests in any Plate package. Not for browser or e2e
  testing.
---

## Overview

Establishes the Plate testing philosophy: Bun-first speed, three test layers
(pure unit, thin editor/plugin contract, golden I/O), and strict seam selection
rules. Covers file organization conventions, fixture and assertion patterns,
package-specific rules (autoformat, markdown, ai, core, slate, selection, docx),
and cleanup heuristics for maintaining test quality over time.

@.claude/skills/testing/testing.mdc
