# Codeblock Fence Test

## Goal

Add a regression test for triple-backtick code block autoformat behavior.

## Context

- User asked for a test around `` ``` `` not autoformatting to a code block.
- The likely owner is the code-block input-rule path, not docs UI.
- Existing learnings point to block-fence input rules as the correct seam.

## Relevant Learnings

- `docs/solutions/best-practices/block-fence-input-rules-should-split-fence-matching-from-feature-apply.md`
- `docs/solutions/best-practices/input-rules-should-register-explicit-rule-instances-while-packages-export-markdown-families.md`

## Working Plan

- [x] Load skills and scan relevant learnings
- [x] Find the narrowest existing code-block/input-rule test seam
- [x] Add a regression test for triple-backtick promotion
- [x] Run the targeted test
- [x] Decide whether the same turn should carry the fix

## Findings

- The core package already had a direct input-rule test in
  `packages/code-block/src/lib/BaseCodeBlockPlugin.inputRules.spec.tsx`.
- The missing coverage was the shipped app kit surface. `CodeBlockKit` is the
  right owner lane because it wires `CodeBlockRules.markdown({ on: 'match' })`
  into the registry editor surface.
- Added app package-integration coverage instead of another core-only test.
- The new regression test passes, so this turn did not need a fix. The request
  was satisfied by locking the contract where regressions are likely to sneak
  in.
