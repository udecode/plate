# Inline / Block Autoformat Spec Gap Scan

## Goal

Apply `editor-spec` to the inline and block-level autoformat surfaces that are
currently missing or under-specified in `docs/editor-behavior`.

## Scope

- inventory shipped or repo-visible autoformat surfaces
- compare them against standards, readable law, protocol, parity, and audit
- patch the missing inline / block-level autoformat law
- keep the pass doc-only unless a code gap blocks honest specing

## Phases

- [x] Read current editor-behavior and research context
- [x] Inventory current autoformat surfaces from repo code
- [x] Identify missing or under-specified inline / block-level surfaces
- [x] Patch research and editor-behavior docs
- [x] Read back for contradictions and explicit no-change layers

## Progress Log

- 2026-04-09: inventoried current repo-visible autoformat families across
  `@platejs/autoformat` and the app kits
- 2026-04-09: compiled new Typora and Milkdown research pages plus one decision
  and one open question for thinner text-substitution authority

## Notes

- This is an `editor-spec` pass, not an implementation pass.
- If a surface needs stronger external evidence, route through `research-wiki`
  instead of bluffing.
