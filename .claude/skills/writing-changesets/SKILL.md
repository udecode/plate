---
name: writing-changesets
description: >-
  Changeset authoring conventions for Plate package releases following Radix UI
  style. Covers file naming, YAML frontmatter structure, imperative voice,
  one-package-per-file rule, and the critical constraint that core packages
  (@platejs/slate, @platejs/core, platejs) must use patch not minor to avoid
  version cascade. Use when creating .changeset/*.md files, documenting package
  changes, or writing registry changelog entries. Not for commit messages, PR
  descriptions, or internal documentation.
---

## Overview

Defines how to write changeset files for Plate releases: one package per file,
imperative voice (Add/Fix/Remove, not past tense), bold for package and plugin
names, minimal code examples for API changes only, and a strict rule that core
dependency changesets must use `patch` instead of `minor` to prevent cascade
bumps across all dependent packages. Includes templates for simple fixes, API
changes, and breaking changes, plus a red-flags checklist to verify before
submitting.

@.claude/skills/writing-changesets/writing-changesets.mdc
