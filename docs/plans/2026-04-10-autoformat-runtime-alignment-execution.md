# Autoformat Runtime Alignment Execution

## Goal

Complete Lane 1: autoformat runtime alignment and extension.

## Execution Slice

Ship the smallest real closure that satisfies the lane instead of dragging it
 into another planning loop:

1. lock current-kit truth-table gaps in tests
2. move clearly shared heading/mark rules into `@platejs/autoformat`
3. keep app-owned quirks explicit:
   - blockquote wrap
   - list and condensed todo shorthand
   - immediate code-fence promotion
   - immediate HR insertion
   - code-block gating
4. tighten public docs so `autoformat` stops pretending every shorthand is one
   generic package feature

## Touchpoints

- `packages/autoformat/src/lib/rules/**`
- `packages/autoformat/src/lib/__tests__/withAutoformat/**`
- `apps/www/src/registry/components/editor/plugins/autoformat-kit.tsx`
- `apps/www/src/registry/components/editor/plugins/autoformat-classic-kit.tsx`
- `apps/www/src/__tests__/package-integration/autoformat/**`
- `content/(plugins)/(functionality)/autoformat.mdx`
- lane-close docs if verification is good

## Verification Target

- package tests for heading / mark / text rule families
- app integration tests for current-kit precedence, code-fence, HR, and
  code-block gating
- build/typecheck/lint for touched code

## Progress

- [done] Added shared `@platejs/autoformat` exports for heading shorthand and
  inline mark autoformat.
- [done] Rewired the app kits so package-owned rules and app-owned shorthand are
  visibly separate.
- [done] Added package and app truth-table coverage for:
  - heading shorthand
  - mark autoformat
  - stronger text substitution rows
  - current-kit precedence for `==`
  - current-kit code-fence promotion
  - current-kit HR insertion
  - code-block gating
- [done] Updated public `/docs/autoformat` docs to state the ownership split and
  keep link automd outside the generic autoformat family.
- [done] Closed the autoformat lane in the editor-behavior roadmap docs.
