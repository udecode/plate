---
title: Autoformat insert input rules should resolve once and pass payload
date: 2026-04-10
category: best-practices
module: autoformat
problem_type: best_practice
component: tooling
symptoms:
  - Insert input rules had to recompute the same match data in both `query` and `format`.
  - Math input rules carried duplicated lookup helpers just to bridge the gap between gating and formatting.
  - New payload-based input rules were awkward because the rule contract only exposed a boolean gate.
root_cause: inadequate_documentation
resolution_type: code_change
severity: medium
tags: [autoformat, input-rules, api-design, math]
---

# Autoformat insert input rules should resolve once and pass payload

## Problem

`insertTextRules` and `insertBreakRules` only supported a boolean `query` gate.
That forced richer rules to compute the same match twice: once to decide whether
the rule should run, then again inside `format` to recover the payload.

## Symptoms

- Math input rules had `getInlineEquationMatch` and `getBlockEquationTarget`
  helpers called from both `query` and `format`.
- The runtime could only say "yes or no", not "yes, and here is the resolved
  match you already paid to compute".
- Reusable payload-driven input rules were possible in spirit but awkward in
  the actual type contract.

## What Didn't Work

- Treating payload lookup as a math-specific problem.
- Keeping `query` as the only gate and stuffing payload recovery into `format`.
- Moving more equation-specific helpers into the shared runtime instead of
  fixing the generic rule contract.

## Solution

Add `resolve` to insert input rules and pass the resolved value into `format`.
Keep `query` working as a simple pre-check for rules that only need a boolean
gate.

```ts
export type AutoformatInsertTextRule<TMatch = true> = {
  trigger?: readonly string[] | string;
  query?: (editor, context) => boolean;
  resolve?: (editor, context) => TMatch | undefined;
  format: (editor, context, match: TMatch) => void;
};
```

Then the runtime resolves once and forwards the payload:

```ts
const match = resolveInsertTextRuleMatch(rule, currentEditor, context);

if (match === undefined) return false;

rule.format(currentEditor, context, match);
```

That lets math rules stay local but shorter:

```ts
export const autoformatInlineEquation: AutoformatInsertTextRule<{
  deleteRange: TRange;
  texExpression: string;
}> = {
  trigger: '$',
  resolve: (editor, { options, text }) => {
    if (text !== '$' || options?.at || isEquationInputBlocked(editor)) return;

    return getInlineEquationMatch(editor);
  },
  format: (editor, _context, match) => {
    editor.tf.withoutNormalizing(() => {
      editor.tf.delete({ at: match.deleteRange });
      editor.tf.select(match.deleteRange.anchor);
      editor.tf.insertNodes({
        children: [{ text: '' }],
        texExpression: match.texExpression,
        type: editor.getType(KEYS.inlineEquation),
      });
    });
  },
};
```

## Why This Works

The runtime stays generic while richer rules get a real payload lane.

- Generic rules can still use `query` only.
- Payload rules can use `resolve` and skip duplicated recomputation.
- Package-owned logic stays in the package rule file instead of leaking
  equation-specific assumptions into the core runtime.

## Prevention

- If an input rule needs data later in `format`, prefer a `resolve` payload over
  recomputing it through `query`.
- Keep `query` for cheap boolean gates; use `resolve` when the match carries
  structure.
- Do not add feature-specific helpers to the shared runtime when the real gap is
  the generic rule contract.

## Related Issues

- [2026-04-10-autoformat-runtime-alignment-and-extension-plan.md](../../plans/2026-04-10-autoformat-runtime-alignment-and-extension-plan.md)
