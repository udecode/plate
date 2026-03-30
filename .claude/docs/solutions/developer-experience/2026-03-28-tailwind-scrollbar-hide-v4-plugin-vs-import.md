---
title: Tailwind scrollbar-hide v4 plugin-vs-import issues need a compile diff
date: 2026-03-28
category: developer-experience
module: Plate UI Registry
problem_type: developer_experience
component: tooling
symptoms:
  - An old issue claimed Tailwind v4 output was wrong because the registry used `@plugin "tailwind-scrollbar-hide"` instead of `@import "tailwind-scrollbar-hide/v4"`
  - The upstream package README recommended the `/v4` import path, making the issue look valid at first glance
  - The current repo still contained the plugin-based form in app and template CSS
root_cause: inadequate_documentation
resolution_type: workflow_improvement
severity: low
tags: [tailwindcss, shadcn, registry, scrollbar-hide, stale-issue, css]
---

# Tailwind scrollbar-hide v4 plugin-vs-import issues need a compile diff

## Problem
An old issue reported that Plate's Tailwind v4 integration for `tailwind-scrollbar-hide` was wrong because it still used the plugin form instead of the package's documented `/v4` CSS import. That sounded plausible, but the real question was not what the README preferred. The real question was whether the current integration was actually broken.

## Symptoms
- The repo still used `@plugin "tailwind-scrollbar-hide"` in Tailwind v4 CSS.
- The package README recommended `@import "tailwind-scrollbar-hide/v4"` for Tailwind v4.
- The issue was still open, even though it was old and had no follow-up reproduction.

## What Didn't Work
- Reading the package README alone was not enough. It showed the preferred Tailwind v4 setup, but it did not prove that the plugin form had stopped working.
- Looking only at repo source was also not enough. Seeing `@plugin "tailwind-scrollbar-hide"` in the repo showed drift from the docs, not a live bug.

## Solution
Compile both forms against the current stack before deciding whether the issue is still valid.

Use a tiny Tailwind v4 repro that forces the utilities to emit:

```css title="plugin.css"
@import "tailwindcss";
@source inline("scrollbar-hide scrollbar-default");
@plugin "tailwind-scrollbar-hide";
```

```css title="import.css"
@import "tailwindcss";
@source inline("scrollbar-hide scrollbar-default");
@import "tailwind-scrollbar-hide/v4";
```

Then diff the generated CSS, not just the input syntax.

In this case, both paths compiled successfully on the current stack. The emitted `.scrollbar-hide` and `.scrollbar-default` utilities matched for current browsers. The only observed delta was that the plugin form kept the legacy `-ms-overflow-style` declarations while the `/v4` import dropped them.

That changed the conclusion completely: the issue was no longer a live bug. It had become a cleanup or docs-alignment request.

## Why This Works
`tailwind-scrollbar-hide@4.0.0` still exports a JS plugin at the package root and a CSS-only Tailwind v4 entry at `./v4`. The README prefers the CSS import for Tailwind v4, but the root plugin path still compiles under the current Tailwind 4 toolchain.

The important detail is that the `/v4` path is not the only working path anymore. It is the documented path. Those are not the same claim.

## Prevention
- When an old issue says "this import syntax is wrong," verify it with a fresh compile on the current dependency versions before treating it as a bug.
- Diff generated CSS or runtime behavior, not just source text. API migration issues often age into no-ops.
- Treat package README guidance as strong evidence, not proof of breakage.

## Related Issues
- https://github.com/udecode/plate/issues/4510
