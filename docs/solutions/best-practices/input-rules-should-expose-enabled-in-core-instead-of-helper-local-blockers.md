---
title: Input rules should expose enabled in core instead of helper-local blockers
date: 2026-04-15
category: best-practices
module: core
problem_type: best_practice
component: tooling
symptoms:
  - Packages like math and code-block carried local `isBlocked(editor)` checks that apps could not cleanly override.
  - Helper APIs started growing one-off blocker options like `isBlocked` instead of sharing one gating contract.
  - App-level overrides for package markdown rules required rewriting package logic instead of changing one predicate.
root_cause: inadequate_documentation
resolution_type: code_change
severity: medium
tags: [input-rules, api-design, gating, math, code-block, autoformat]
---

# Input rules should expose enabled in core instead of helper-local blockers

## Problem

Input-rule gating was drifting into helper-local APIs.

- `createBlockFenceInputRule` carried `isBlocked`
- `createTextSubstitutionInputRule` carried `isBlocked`
- inline math carried its own `isEquationInputBlocked` check inside `resolve`

That was the wrong layer. Apps do not want ten different blocker escape hatches.
They want one obvious override point.

## What Didn't Work

- Encoding rule gating as helper-specific `isBlocked(editor)` options.
- Hardcoding package blockers inside `resolve`, where app code cannot override
  them without replacing the whole rule.
- Letting core helpers drift into slightly different gating APIs for the same
  job.

## Solution

Make `enabled(context)` part of the core input-rule contract and let the runtime
evaluate it before `resolve`.

```ts
defineInputRule({
  enabled: ({ editor }) => !editor.api.some(...),
  target: 'insertText',
  trigger: '$',
  resolve,
  apply,
});
```

Then helpers just forward `enabled`:

```ts
createBlockFenceInputRule({
  enabled: ({ editor }) => !isCodeBlockInputBlocked(editor),
  fence: '```',
  on: 'match',
  apply,
});
```

Package surfaces can keep ergonomic app-facing options:

```ts
MathRules.markdown({
  variant: '$',
  enabled: (editor) => true,
});
```

## Why This Works

- Core owns the generic gating lane once.
- Helpers stop inventing their own blocker option names.
- Packages can ship sane defaults while still letting apps override them.
- `resolve` goes back to matching instead of mixed matching-plus-policy logic.

## Prevention

- If a rule needs an app-overridable gate, put it on `enabled` in core.
- Do not add new helper-local blocker knobs when the runtime can gate the rule.
- Keep package defaults package-local, but make the override lane generic.

## Related Issues

- [2026-04-14-input-rules-recipe-registration-plan.md](../../plans/2026-04-14-input-rules-recipe-registration-plan.md)
- [block-fence-input-rules-should-split-fence-matching-from-feature-apply.md](./block-fence-input-rules-should-split-fence-matching-from-feature-apply.md)
