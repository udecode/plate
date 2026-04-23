# Math Trigger Execution

## Goal

Implement the first safe rich-mode math trigger slice directly.

## Scope

- no selection-wrap shipping by default
- no opening-delimiter pair-on-type for `$`
- allow explicit-completion rich-mode conversion
- implement `$$` + `Enter` block promotion

## Planned Slice

1. shared math trigger plugin in `@platejs/math`
2. inline conversion on completed `$...$` only
3. block conversion on `$$` then `Enter`
4. math kit wiring
5. package + app integration tests
6. docs/law updates so shipped rows match runtime truth

## Verification

- targeted `bun test`
- `pnpm brl`
- build before typecheck
- `pnpm lint:fix`
- browser check if docs/demo surface changed

## Progress

- [done] Added shared rich-mode math trigger infrastructure in `@platejs/math`.
- [done] Shipped the safe slice:
  - completed `$...$` converts inline on closing delimiter
  - `$$` + `Enter` promotes block math
- [done] Kept selection-wrap deferred by default.
- [done] Wired the trigger plugin into `BaseMathKit` and `MathKit`.
- [done] Added package and app integration coverage.
- [done] Updated docs and editor-behavior law to match the shipped slice.
