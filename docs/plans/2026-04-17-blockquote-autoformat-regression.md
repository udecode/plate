# Blockquote Autoformat Regression

## Goal

Reproduce the reported `> ` blockquote autoformat failure in browser, identify
the owner layer, and fix it with fresh verification if it is real.

## Context

- User reports that typing `> ` does not autoformat to blockquote.
- Prior learnings show blockquote autoformat has already regressed once in the
  app layer, especially for nested quotes.
- A fresh clean docs/editor server is running on `localhost:3002`.

## Relevant Learnings

- `docs/solutions/ui-bugs/2026-04-02-blockquote-autoformat-must-wrap-nested-quotes.md`
- `docs/solutions/ui-bugs/2026-04-02-blockquote-transforms-must-keep-selection-inside-the-new-quote.md`

## Working Plan

- [x] Load relevant skills and prior learnings
- [ ] Reproduce root and nested `> ` in a real browser editor
- [ ] Identify whether the failure is package rule, app kit, or dirty dev server
- [ ] Fix the correct owner layer if needed
- [ ] Verify in browser and tests
