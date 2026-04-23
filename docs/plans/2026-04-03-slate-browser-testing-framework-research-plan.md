---
date: 2026-04-03
topic: slate-browser-testing-framework-research-plan
status: in_progress
---

# Slate Browser Testing Framework Research Plan

## Goal

Research the best future testing framework shape for editor work by mining the
local comparison repos, then document the recommended architecture under a new
`slate-browser` doc area inside `docs/`.

## Research Axes

1. speed
2. coverage breadth
3. IME/composition realism
4. deterministic DOM/unit harnesses
5. performance benchmarking hooks
6. agent-native parity for actions beyond Playwright primitives

## Candidate Lenses

- ProseMirror
- Lexical
- Tiptap
- Slate
- edix
- use-editable
- rich-textarea
- markdown-editor
- VS Code / LSP only if they contribute testing architecture ideas

## Expected Output

- one initial research document under `docs/slate-browser/`
- explicit recommended framework layers
- recommendation for which existing frameworks to build on
- explicit agent-native testing lane
- phased adoption path
