---
title: Docs code blocks need light Shiki tokens on light surfaces
date: 2026-05-25
category: docs/solutions/ui-bugs
module: Docs
problem_type: ui_bug
component: documentation
symptoms:
  - "Docs code blocks used low-contrast light tokens on a light code surface"
  - "Command code blocks could render duplicate light and dark output without explicit theme visibility rules"
  - "`github-light-default` crashed docs rendering because the bundled Shiki themes did not include it"
root_cause: config_error
resolution_type: code_fix
severity: medium
tags:
  - docs
  - code-block
  - shiki
  - rehype-pretty-code
  - theme
---

# Docs code blocks need light Shiki tokens on light surfaces

## Problem

Changing the docs code-block container to a light `bg-code` surface is not
enough. If `rehype-pretty-code` still emits only dark-theme tokens, the code
looks washed out or strangely colored on the light background.

## Symptoms

- JSX and TypeScript tokens appear too pale on the light docs code surface.
- The regular `pre` block and npm-command block do not visually match shadcn's
  light code style.
- Trying `github-light-default` throws:

```txt
ShikiError: Theme github-light-default is not included in this bundle
```

## What Didn't Work

- Updating only the `pre`/command wrapper classes to `bg-code` fixed the
  container but left token colors wrong.
- Using shadcn's `github-light-default` theme name matched upstream intent, but
  the current Plate Shiki bundle does not ship that theme.
- Passing the whole `pre` prop object into the command component created a ref
  type mismatch because the command wrapper renders a `div`, not a `pre`.

## Solution

Configure `rehype-pretty-code` with explicit light and dark themes that exist in
the current bundle:

```ts
theme: {
  dark: 'github-dark',
  light: 'github-light',
},
```

Keep metadata propagation theme-aware. The current `rehype-pretty-code` output
can contain separate light and dark `pre[data-theme]` elements, so apply
`__rawString__`, `__src__`, `__event__`, `__style__`, and `__withMeta__` to each
generated `pre`.

Add CSS display rules for the emitted theme variants:

```css
[data-rehype-pretty-code-fragment] > :not(code)[data-theme="light"] {
  display: block;
}

[data-rehype-pretty-code-fragment] > :not(code)[data-theme="dark"] {
  display: none;
}

.dark [data-rehype-pretty-code-fragment] > :not(code)[data-theme="light"] {
  display: none;
}

.dark [data-rehype-pretty-code-fragment] > :not(code)[data-theme="dark"] {
  display: block;
}
```

For command blocks, preserve only the relevant generated attributes such as
`data-language` and `data-theme` when routing the `pre` through the custom
command renderer.

## Why This Works

The visible code surface and the syntax token palette must come from the same
theme mode. Dual-theme Shiki output gives the page both token palettes, and the
CSS rules choose the correct one for the active document theme.

Preserving `data-theme` also keeps command blocks in the same visibility system
as normal code blocks instead of treating them as a special case.

## Prevention

- When changing docs code-block backgrounds, check the actual token colors in
  the browser, not just wrapper class names.
- Prefer theme names that exist in the current Shiki bundle before mirroring an
  upstream shadcn theme string.
- For `rehype-pretty-code` dual-theme output, verify one light block is visible
  in light mode and the dark duplicate is hidden.
- Do not spread `pre` props into a non-`pre` wrapper without checking refs and
  element-specific attributes.

## Related Issues

- [Code block highlight fallback must not throw through DebugPlugin](../logic-errors/2026-04-17-code-block-highlight-fallback-must-not-throw-through-debug-plugin.md)
- [Code block browser highlight must match server output](../logic-errors/2026-04-17-code-block-browser-highlight-must-match-server-output.md)
