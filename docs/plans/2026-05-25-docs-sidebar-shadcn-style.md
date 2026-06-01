# Docs Sidebar Shadcn-Style Update

## Goal

Make the docs left sidebar match the shadcn-style reference: quiet section labels, compact links, active rounded pills, muted disabled entries, and small status dots where labels call for them.

## Scope

- Target `apps/www/src/components/docs-nav.tsx` and immediate layout CSS only if needed.
- Keep navigation data ownership unchanged: Fumadocs page tree feeds the sidebar, with existing metadata overlays.
- Verify on a real docs route in the browser.

## Plan

1. Inspect the current sidebar component and nav item metadata.
2. Compare against the local shadcn reference if present.
3. Implement the sidebar visual update without changing route discovery.
4. Verify with lint/typecheck and browser screenshot.
5. Evaluate whether the result needs a solution note.

## Progress

- Complete: found upstream shadcn source at `../ui/apps/v4/components/docs-sidebar.tsx`.
- Complete: replaced the Plate docs accordion/search nav with static grouped navigation in `apps/www/src/components/docs-nav.tsx`.
- Fixed: `isNavItemActive` needed an explicit recursive return type for TypeScript.
- Fixed: deep active items need to scroll the docs sidebar container explicitly.
- Complete: lint/typecheck and browser verification passed.
- Complete: captured the active-scroll learning in `docs/solutions/ui-bugs/2026-05-25-docs-sidebar-active-scroll-needs-dom-current-query.md`.

## Findings

- `docs/solutions/patterns/critical-patterns.md` is absent in this repo.
- Relevant prior learning: docs visual fixes must be checked in browser, not only by class names.
- The screenshot maps directly to shadcn's v4 `DocsSidebar`: `Sections` label, static groups, `h-[30px] w-fit` active pills, and blue dots for new pages.
