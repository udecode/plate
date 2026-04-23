# Blockquote Autoformat Port 3000

## Goal

Reproduce and fix the reported blockquote autoformat regression where typing
`> ` does not promote to a blockquote on `localhost:3000`.

## Context

- User explicitly asked for live repro on port `3000`.
- Need fresh browser verification, not code-only guessing.
- Existing learnings already mention a prior nested blockquote autoformat bug.

## Relevant Learnings

- `docs/solutions/ui-bugs/2026-04-02-blockquote-autoformat-must-wrap-nested-quotes.md`
- `docs/solutions/best-practices/block-fence-input-rules-should-split-fence-matching-from-feature-apply.md`
- `docs/solutions/best-practices/input-rules-should-register-explicit-rule-instances-while-packages-export-markdown-families.md`

## Working Plan

- [x] Load relevant skills
- [x] Reproduce the bug on `localhost:3000`
- [x] Identify the owner lane and current missing coverage
- [x] Add failing regression test
- [x] Fix the root cause
- [x] Verify in browser and targeted checks

## Findings

- Core already had package-level unit coverage in
  `packages/basic-nodes/src/lib/BaseBlockquoteInputRules.spec.tsx`.
- What was missing was app-level shipped-kit coverage. Added
  `apps/www/src/__tests__/package-integration/blockquote/basic-blocks-kit.slow.tsx`
  to lock both root and nested `> ` promotion in `BasicBlocksKit`.
- The real bug was deeper than blockquote. `createRuleFactory` built
  object-config rules without feeding config defaults into runtime resolver
  input. That made callbacks like `({ marker }) => marker` resolve to
  `undefined` in realistic editor flows.
- Fixed `packages/core/src/lib/plugins/input-rules/createRuleFactory.ts` to
  merge object-config defaults into the runtime factory input.
- Added core regression coverage in
  `packages/core/src/lib/plugins/input-rules/createRuleFactory.spec.ts`.
- Browser automation on `/blocks/basic-blocks-demo` was noisy for raw keystroke
  typing, but pulling the live editor instance from the page and applying the
  real editor transforms on `localhost:3000` proved the fixed path now produces
  a trailing blockquote after `insertBreak()` + `> ` + text.
