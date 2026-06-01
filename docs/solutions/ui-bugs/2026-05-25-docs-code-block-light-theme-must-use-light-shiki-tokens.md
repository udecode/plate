---
title: Docs code blocks need light Shiki tokens on light surfaces
date: 2026-05-25
last_updated: 2026-05-25
category: docs/solutions/ui-bugs
module: Docs
problem_type: ui_bug
component: documentation
symptoms:
  - "Docs code blocks used low-contrast light tokens on a light code surface"
  - "Command code blocks could render duplicate light and dark output without explicit theme visibility rules"
  - "`github-light-default` crashed docs rendering because the bundled Shiki themes did not include it"
  - "Client-rendered React SyntaxHighlighter blocks could keep light token styles after switching to dark mode"
  - "Code blocks with `showLineNumbers` metadata still rendered without visible line numbers"
root_cause: config_error
resolution_type: code_fix
severity: medium
tags:
  - docs
  - code-block
  - hydration
  - next-themes
  - react-syntax-highlighter
  - shiki
  - rehype-pretty-code
  - theme
  - line-numbers
---

# Docs code blocks need light Shiki tokens on light surfaces

## Problem

Changing the docs code-block container to a light `bg-code` surface is not
enough. If `rehype-pretty-code` still emits only dark-theme tokens, the code
looks washed out or strangely colored on the light background.

The same rule applies to client-rendered `react-syntax-highlighter` blocks:
the wrapper surface, token palette, and theme switching behavior all need to
agree.

Line numbers have the same coupling problem: `showLineNumbers` only marks the
code block. The rendered line nodes also need to match the CSS selector that
draws the counters.

## Symptoms

- JSX and TypeScript tokens appear too pale on the light docs code surface.
- The regular `pre` block and npm-command block do not visually match shadcn's
  light code style.
- React SyntaxHighlighter blocks render dark or mismatched colors on light docs
  surfaces.
- Dark mode can show a dark `bg-code` wrapper while the token spans keep light
  theme colors.
- Code fences with `showLineNumbers` emit `data-line-numbers`, but no visible
  numbers appear because each line renders as `class="line"` instead of matching
  the docs `[data-line]` counter selector.
- Rendering separate light and dark highlighters doubles Prism tokenization and
  DOM size on code-heavy pages.
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
- Hiding one `react-syntax-highlighter` instance with `dark:hidden` still mounts
  and tokenizes both themes.
- Picking the SyntaxHighlighter theme directly from `useTheme()` on the first
  client render can create a server/client inline-style mismatch that React does
  not reliably patch.
- Letting imported highlighter themes keep `background`, `backgroundColor`, or
  `border` on the rendered surface conflicts with the docs `bg-code` wrapper and
  can trigger React style shorthand warnings during theme updates.
- Adding `showLineNumbers` metadata alone is incomplete if `onVisitLine` does
  not add the attribute expected by the docs CSS.
- Adding `showLineNumbers` before `rehype-pretty-code` is still not enough if
  later post-processing handles the generated fragment but never restores
  `data-line-numbers` onto each emitted `code` element.

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

For line numbers, keep the metadata and line-node selector in sync. Add
`showLineNumbers` to multi-line source snippets before `rehype-pretty-code`
runs, and make every visited line expose the attribute used by the existing CSS:

```ts
onVisitLine(node: any) {
  node.properties['data-line'] = '';

  if (node.children.length === 0) {
    node.children = [{ type: 'text', value: ' ' }];
  }
}
```

When post-processing `rehype-pretty-code` fragments, carry a private boolean
from the original `pre` node and apply `data-line-numbers` to every generated
`pre > code` child. This is more robust than depending only on synthetic meta,
especially when dual light/dark `pre[data-theme]` nodes are emitted.

Client-rendered highlighters should make the same source-vs-command distinction:
show line numbers for multi-line source code and keep single-line install
commands clean.

For React SyntaxHighlighter-backed surfaces, render exactly one highlighter and
select its theme in a shared client component:

```tsx
const theme = mounted && resolvedTheme === 'dark' ? darkTheme : lightTheme;

return (
  <SyntaxHighlighter {...props} style={theme as any}>
    {children}
  </SyntaxHighlighter>
);
```

Keep the first render deterministic by using the light theme until the component
mounts. Normalize imported Prism themes so the wrapper owns background and
border styling:

```ts
function normalizeTheme(theme: Record<string, React.CSSProperties>) {
  const {
    background: _preBackground,
    backgroundColor: _preBackgroundColor,
    border: _preBorder,
    ...preStyle
  } = theme['pre[class*="language-"]'] ?? {};

  return {
    ...theme,
    ['pre[class*="language-"]']: preStyle,
  };
}
```

## Why This Works

The visible code surface and the syntax token palette must come from the same
theme mode. Dual-theme Shiki output gives the page both token palettes, and the
CSS rules choose the correct one for the active document theme.

Preserving `data-theme` also keeps command blocks in the same visibility system
as normal code blocks instead of treating them as a special case.

For line numbers, `rehype-pretty-code` sets `data-line-numbers` on the `code`
element, while the docs counter CSS increments on each line. Adding `data-line`
to `onVisitLine` connects those two halves.

For client highlighters, the initial server-rendered style and the first client
render must match. After mount, a normal state update can switch to the active
`next-themes` mode and React will patch the token styles. Rendering a single
highlighter also avoids doubling Prism work on release notes and other
code-heavy pages.

## Prevention

- When changing docs code-block backgrounds, check the actual token colors in
  the browser, not just wrapper class names.
- Prefer theme names that exist in the current Shiki bundle before mirroring an
  upstream shadcn theme string.
- For `rehype-pretty-code` dual-theme output, verify one light block is visible
  in light mode and the dark duplicate is hidden.
- For client-side highlighters, verify the first visible code block has exactly
  one mounted highlighter in both light and dark mode.
- When enabling line numbers, inspect rendered HTML for both
  `data-line-numbers` on `code` and `data-line` on each line.
- If `data-line` exists but numbers are invisible, check whether the generated
  `code` still has `data-line-numbers` after all post-processing plugins run.
- Treat React hydration or shorthand style warnings as real style bugs when code
  themes are controlled by inline style objects.
- Do not spread `pre` props into a non-`pre` wrapper without checking refs and
  element-specific attributes.

## Related Issues

- [Code block highlight fallback must not throw through DebugPlugin](../logic-errors/2026-04-17-code-block-highlight-fallback-must-not-throw-through-debug-plugin.md)
- [Code block browser highlight must match server output](../logic-errors/2026-04-17-code-block-browser-highlight-must-match-server-output.md)
