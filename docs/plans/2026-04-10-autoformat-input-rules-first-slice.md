# Autoformat Input Rules First Slice

## Goal

Create a shared input-rules runtime in `@platejs/autoformat` that can own both:

- the existing `insertText`-driven autoformat dispatch
- neighboring non-plain-autoformat input behavior such as math delimiter conversion

without lying that math is just another plain autoformat rule.

## Findings

- `AutoformatPlugin` currently owns a text-only rule loop in
  [AutoformatPlugin.ts](packages/autoformat/src/lib/AutoformatPlugin.ts).
- math delimiter conversion needs both `insertText` and `insertBreak`, which
  makes it a bad fit for plain text-only autoformat rules but a good fit for a
  shared autoformat-owned input-rule lane.
- Current editor-behavior law still correctly says math delimiter triggers are
  outside the plain autoformat family, under source-preserving conversion.
- The right unification target is shared input-rule infrastructure, not a
  larger `AutoformatPlugin` rule union pretending `Enter` promotion is text
  autoformat.

## Recommended First Slice

1. Add shared input-rule types and runner helpers in `@platejs/autoformat`.
2. Refactor `AutoformatPlugin` to use the shared `insertText` input-rule
   runner.
3. Move math delimiter conversion fully onto `AutoformatPlugin` through
   autoformat-owned `insertTextRules` and `insertBreakRules`.
4. Keep package boundaries honest:
   - `AutoformatPlugin` still owns plain block/mark/text autoformat.
   - math keeps only equation node/render/transform ownership.
   - `@platejs/autoformat` owns the reusable input-rule runtime and the math
     delimiter input rules.

## Verification Target

- package tests for autoformat and math still pass
- package/app build and typecheck pass
- docs expose `AutoformatPlugin` + `autoformatMathInput`
- no legacy math trigger plugin names remain

## Notes

- If verified code lands in both packages, add a changeset before handoff.

## Progress

- Added shared input-rule runners in
  [packages/autoformat/src/lib/inputRules.ts](packages/autoformat/src/lib/inputRules.ts).
- Refactored
  [AutoformatPlugin.ts](packages/autoformat/src/lib/AutoformatPlugin.ts)
  to dispatch both plain autoformat text rules and autoformat-owned
  `insertText` / `insertBreak` input rules through the shared runtime.
- Added autoformat-owned math delimiter rules in
  [autoformatMathInput.ts](packages/autoformat/src/lib/rules/math/autoformatMathInput.ts).
- Added autoformat runner unit coverage in
  [inputRules.spec.ts](packages/autoformat/src/lib/inputRules.spec.ts).
- Patched architecture notes so the neighboring input-rule lane can live in
  shared `@platejs/autoformat` infrastructure without pretending math is plain
  autoformat.
- Deleted the separate math input plugin surface so math input behavior is
  fully hosted on autoformat.
- Added package changesets for the new autoformat-owned input-rule surface and
  the math package breaking change.

## Verification

- `pnpm --filter @platejs/autoformat test -- inputRules.spec.ts AutoformatPlugin.spec.tsx`
- `pnpm --filter @platejs/autoformat test -- autoformatMathInput.spec.tsx`
- `bun test packages/autoformat/src/lib/rules/math/autoformatMathInput.spec.tsx apps/www/src/__tests__/package-integration/math/math-trigger.slow.tsx`
- `pnpm install`
- `pnpm brl`
- `pnpm build`
- `pnpm turbo typecheck --filter=./packages/autoformat --filter=./packages/math --filter=./packages/code-block --filter=./apps/www`
- `pnpm lint:fix`
- browser verification on `http://127.0.0.1:3200/blocks/playground`:
  typing a unique `ZZZMathStart $x$` sequence converted to an inline equation
  node, removed the literal dollar-delimited text, and left KaTeX-backed inline
  math markup in the editor DOM
