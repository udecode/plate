---
title: Bun module mocks must export a consistent surface across related specs
date: 2026-03-24
type: solution
category: test-failures
module: testing
tags:
  - bun
  - mocks
  - tests
  - react
---

# Problem

Targeted React spec runs started failing with nonsense like:

- `Export named 'usePluginOption' not found`
- `Export named 'MarkdownPlugin' not found`
- `Export named 'SkipSuggestionDeletes' not found`

The product code was fine. The failures only showed up when multiple spec files ran together.

# Cause

Bun module mocks were colliding across related specs.

Two different spec files mocked the same module id with different export shapes. When Bun executed those files together, one mock surface effectively replaced the other, and a third file imported a named export that no longer existed.

This showed up most often with shared modules like:

- `platejs/react`
- `@platejs/markdown`
- `@platejs/suggestion`

# Fix

Use one of these approaches:

1. Keep related tests in the same spec file when they need the same mocked module.
2. If multiple spec files must mock the same module, make every mock export the same superset surface.
3. When mocking relative package internals, put the spec close to the module under test so the mock path matches the real import path exactly.

# Rule

When Bun tests start failing only in combined runs and the error is “named export not found,” suspect shared mock-surface drift before blaming the product code.
