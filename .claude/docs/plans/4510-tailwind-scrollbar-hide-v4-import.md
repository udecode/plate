# Issue 4510: tailwind-scrollbar-hide v4 import

## Source of truth

- Source type: GitHub issue
- Source id: #4510
- Title: `tailwind-scrollbar-hide` should be imported as `@import "tailwind-scrollbar-hide/v4";`
- URL: https://github.com/udecode/plate/issues/4510
- State: open
- Task type: bug investigation, likely code fix
- Expected outcome: confirm whether current CLI/template output still emits the wrong Tailwind v4 syntax, and fix it if still valid
- Caveats: issue is old, so first confirm it still reproduces on current code before changing anything
- Likely areas: template CSS, registry/CLI file generation, docs if they still describe the old syntax
- Browser surface: no direct browser proof required unless the fix changes rendered UI

## Plan

1. Search current codebase and templates for `tailwind-scrollbar-hide` usage and identify generation path.
2. Confirm whether the current generator still ships the old `@plugin` syntax for Tailwind v4 consumers.
3. Apply the smallest fix in source files that own generated output.
4. Run targeted verification for the touched package/template path.
5. Decide whether issue sync-back or PR work is warranted based on whether code changed.

## Findings

- The repo still contains `@plugin "tailwind-scrollbar-hide";` in app/template CSS and a registry style item that installs `tailwind.config.plugins = ['tailwind-scrollbar-hide']`.
- The upstream package docs for `tailwind-scrollbar-hide@4.0.0` recommend `@import "tailwind-scrollbar-hide/v4";` for Tailwind v4.
- Current Tailwind 4 behavior does not treat the existing plugin form as broken:
  - `@plugin "tailwind-scrollbar-hide";` compiles successfully.
  - `@import "tailwind-scrollbar-hide/v4";` also compiles successfully.
  - The generated scrollbar utilities are effectively the same for current browsers.
  - The only observed output delta is that the `@plugin` path keeps `-ms-overflow-style` declarations, while the `/v4` import drops them.
- Conclusion: issue #4510 no longer describes a live bug on the current stack. At most, it is a cleanup/docs-alignment request.

## Progress

- Fetched issue and comments with `gh issue view`.
- Loaded task, planning-with-files, and learnings-researcher instructions.
- Searched repo for `tailwind-scrollbar-hide` references.
- Verified upstream package guidance from the installed `tailwind-scrollbar-hide@4.0.0` README and exports.
- Reproduced both Tailwind v4 compile paths locally and diffed the emitted CSS.
