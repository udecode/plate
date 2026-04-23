---
module: Input Rules
date: 2026-04-17
problem_type: logic_error
component: tooling
symptoms:
  - "Typing `> ` after `Enter` in the basic blocks demo left literal text instead of creating a blockquote"
  - "Factory-built rules like `BlockquoteRules.markdown()` resolved to `undefined` in realistic editor flows even though the current block text matched"
  - "Simple package unit coverage could still pass while object-config factory defaults were missing from runtime resolver input"
root_cause: logic_error
resolution_type: code_change
severity: high
tags:
  - input-rules
  - create-rule-factory
  - blockquote
  - defaults
  - editor-kit
  - runtime
---

# createRuleFactory object defaults must reach runtime input

## Problem

`createRuleFactory` accepted object-config defaults like `marker: '>'`, but it
did not pass those defaults into the runtime input used by `match`, `enabled`,
and other factory-resolved values.

That broke real editor flows using object-config factories, even when the rule
looked correct in code.

## Symptoms

- In `/blocks/basic-blocks-demo`, creating a fresh paragraph and typing `> `
  could leave a plain paragraph with literal `> ` text.
- A direct inspection of the shipped blockquote rule showed:
  - `enabled === true`
  - `getBlockStartText() === '>'`
  - `resolve() === undefined`
- The failure was easiest to see in realistic sequences like:
  - existing demo content
  - `insertBreak()`
  - `insertText('>')`
  - `insertText(' ')`

## What Didn't Work

- Trusting the tiny package unit seam alone.
- Assuming the default object config was automatically part of the runtime
  input.
- Looking only at browser typing before checking the generated rule itself.

## Solution

Merge object-config defaults into the runtime factory input before resolving
factory values.

The buggy shape only merged `options` and `context`:

```ts
getMergedInput(context, options)
```

That dropped defaults defined on the factory config object itself.

The fix introduces `factoryOptions` and feeds that merged object into runtime
resolution:

```ts
const factoryOptions =
  typeof configOrBuilder === 'function'
    ? options
    : { ...(configOrBuilder as Record<string, unknown>), ...options };

const getFactoryInput = <TContext extends object>(context: TContext) =>
  getMergedInput(context, factoryOptions);
```

Then use `getFactoryInput(...)` everywhere factory values are resolved.

## Why This Works

Object-config factories have two sources of data:

- static defaults from the config object
- runtime overrides from public options

The old implementation only passed the second one through. Once the default
config values reach the runtime input again, matchers like
`({ marker }) => marker` work in real editor flows instead of silently
resolving to `undefined`.

## Prevention

- For factory-based APIs, test both:
  - object-config defaults with no public overrides
  - explicit public overrides
- When a resolver callback reads a config field like `marker`, `variant`, or
  `fence`, verify that field exists in the runtime input, not just in the type
  signature.
- Add one realistic editor-sequence test whenever an input rule bug only shows
  up after `insertBreak()` or another state-changing transform.

## Related Issues

- [2026-04-02-blockquote-autoformat-must-wrap-nested-quotes.md](../ui-bugs/2026-04-02-blockquote-autoformat-must-wrap-nested-quotes.md)
- [block-fence-input-rules-should-split-fence-matching-from-feature-apply.md](../best-practices/block-fence-input-rules-should-split-fence-matching-from-feature-apply.md)
