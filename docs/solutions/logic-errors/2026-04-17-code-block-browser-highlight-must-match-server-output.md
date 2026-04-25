---
module: Code Block
date: 2026-04-17
problem_type: logic_error
component: editor_transforms
symptoms:
  - "Opening `/blocks/code-block-demo` logged repeated `[CODE_HIGHLIGHT]` warnings for `python` in the browser"
  - "React threw `Hydration failed because the server rendered text didn't match the client` on the Python sample"
  - "The live demo could look broken or stale even though code-block input-rule tests were green"
root_cause: logic_error
resolution_type: code_change
severity: medium
tags:
  - code-block
  - highlight
  - hydration
  - browser
  - python
  - docs
---

# Code block browser highlight must match server output

## Problem

The standalone code block demo could hydrate into a broken client tree even
though the editor logic itself was fine.

The bad sample was the Python code block on `/blocks/code-block-demo`.

## Symptoms

- Browser console spammed `[CODE_HIGHLIGHT] Could not highlight with Highlight.js for language "python". Falling back to plaintext`
- React raised a hydration mismatch on the Python block
- The server rendered highlighted Python tokens, but the browser rebuilt the
  same block as plaintext
- Triple-backtick debugging went sideways because the route was already in a
  poisoned hydration state

## What Didn't Work

- Treating the regression like another broken input rule after the fence rule
  had already been fixed
- Changing demo glue such as mounted-only rendering or lowlight presets without
  proving the route still mismatched on a clean dev server
- Trusting a dirty `.next` state; stale dev output obscured the real failure

## Solution

Patch the provided `lowlight` instance inside `@platejs/code-block` before
highlighting Python, so kits can stay unchanged.

```ts
ensureStablePythonGrammar(lowlight, effectiveLanguage);
```

Files:

- [ensureStablePythonGrammar.ts](packages/code-block/src/lib/ensureStablePythonGrammar.ts)
- [setCodeBlockToDecorations.ts](packages/code-block/src/lib/setCodeBlockToDecorations.ts)

The vendored grammar is adapted from the older Highlight.js Python definition
that still uses `beginKeywords` and ASCII identifier matching instead of the
newer `unicodeRegex + match[]` path that explodes in the Turbopack browser
bundle.

The patch mutates the caller-provided `lowlight` instance once, overriding only
the Python grammar and its aliases:

```ts
lowlight.register('python', pythonBrowserSafe);
lowlight.registerAlias('python', ['py', 'gyp', 'ipython']);
```

That keeps `createLowlight(all)` in app kits untouched while making server and
browser share the same stable Python tokenizer.

Regression coverage:

- [setCodeBlockToDecorations.spec.ts](packages/code-block/src/lib/setCodeBlockToDecorations.spec.ts)

## Why This Works

The bug was not "Python cannot be server-rendered." The bug was "the current
Highlight.js 11 Python grammar compiles differently in the Turbopack browser
bundle than it does on the server."

The bad path came from the newer grammar features:

- `unicodeRegex: true`
- `match: [...]` multi-class rules for `def` and `class`

In the browser bundle, Highlight.js core rebuilt that into a huge character
class with an out-of-order range, so Python highlighting threw before the
editor finished normalizing.

By swapping only Python to the older browser-safe grammar, both server and
browser render the same highlighted tree again, and the hydration mismatch goes
away without sacrificing Python syntax highlighting.

## Prevention

- For code-block browser regressions, prove whether the failure is in the input
  rule or in initial route hydration before editing editor logic.
- If one language grammar is runtime-unstable, override that language
  specifically before disabling highlighting wholesale.
- If the package already owns the highlight execution path, a package-level
  grammar patch is cleaner than pushing bundler-specific setup into every app
  kit.
- After fixing route-specific browser bugs, rerun the live demo on a clean dev
  server instead of trusting hot-reloaded state.

## Verification

```bash
bun test packages/code-block/src/lib/setCodeBlockToDecorations.spec.ts
bun test packages/code-block/src/lib/BaseCodeBlockPlugin.inputRules.spec.tsx
bun test ./apps/www/src/__tests__/package-integration/code-block/current-kit.slow.tsx
pnpm install
pnpm turbo build --filter=./packages/code-block --filter=./apps/www
pnpm turbo typecheck --filter=./packages/code-block --filter=./apps/www
pnpm lint:fix
```

Browser proof:

- Fresh `dev-browser` load of `http://localhost:3001/blocks/code-block-demo`
  shows no hydration error and no `[CODE_HIGHLIGHT]` warnings for Python
- `editor.plugins.code_block.options.lowlight.highlight('python', ...)`
  succeeds in the live page and returns highlighted nodes
- Typing ```` ``` ```` in a reset paragraph still creates a `code_block` with
  one `code_line` and no leftover backticks

## Related Issues

- [2026-04-17-code-block-highlight-fallback-must-not-throw-through-debug-plugin.md](./2026-04-17-code-block-highlight-fallback-must-not-throw-through-debug-plugin.md)
- [2026-03-27-code-block-format-must-rebuild-code-lines.md](./2026-03-27-code-block-format-must-rebuild-code-lines.md)
