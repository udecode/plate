---
title: Shadcn docs sidebar parity needs source and DOM metrics
date: 2026-05-27
category: developer-experience
module: apps/www docs shell
problem_type: developer_experience
component: documentation
symptoms:
  - "Plate docs sidebar looked close to shadcn but still had visibly different left offset and vertical rhythm"
  - "Manual Tailwind tweaks fixed one screenshot and broke another"
  - "Local ../ui source did not fully match the deployed shadcn docs DOM"
root_cause: config_error
resolution_type: code_fix
severity: medium
tags: [shadcn, docs, sidebar, layout, browser-smoke]
---

# Shadcn docs sidebar parity needs source and DOM metrics

## Problem

The docs shell was being adjusted from screenshots instead of using shadcn as the implementation source. That left small but visible mismatches in sidebar offset, item height, active state shape, page top spacing, and right-side TOC placement.

## Symptoms

- `Sections` and the first sidebar item did not line up with shadcn at the same viewport.
- Sidebar items looked too wide because the old custom nav used full-width rows instead of shadcn's `w-fit` menu buttons.
- The page top offset was 8px short because Plate kept `--header-height` at `calc(var(--spacing) * 14)` on large screens.
- Local `../ui/apps/v4/components/docs-sidebar.tsx` was close, but the deployed shadcn page used `SidebarContent` without `mx-auto` and with `px-2.5`.

## What Didn't Work

- Tweaking `text-sm`, `font-medium`, and `pt-*` values by eye.
- Keeping the custom `DocsNav` structure and copying only individual classes.
- Relying only on the local `../ui` file after browser metrics showed the deployed shadcn DOM differed in the sidebar content wrapper.

## Solution

Use shadcn's docs shell structure instead of custom nav markup:

- Wrap docs routes in `SidebarProvider` with the upstream grid and `--sidebar-width`.
- Render the left nav with `Sidebar`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarMenu`, `SidebarMenuItem`, and `SidebarMenuButton`.
- Use the upstream menu button class: `h-[30px] w-fit text-[0.8rem] font-medium` with `data-[active=true]:bg-accent`.
- Match the deployed shadcn wrapper: `SidebarContent` uses `w-(--sidebar-menu-width) overflow-x-hidden px-2.5` without `mx-auto`.
- Add `lg:[--header-height:calc(var(--spacing)*16)]` to the body shell.
- Verify with browser metrics at the same viewport, comparing `Sections`, first item, active item, `h1`, and TOC title coordinates.

## Why This Works

The sidebar is a composition of shadcn sidebar primitives, not just a list of links. Matching those primitives fixes the row width, active background, padding, scroll fades, border line, and label rhythm together.

Browser metrics catch the remaining drift that source reading can miss when local upstream source and deployed shadcn are not perfectly aligned.

## Prevention

- For shadcn parity work, copy the upstream structure first, then measure the deployed page and local page at the same viewport.
- Avoid screenshot-only Tailwind tweaks for layout parity.
- Record the measured x/y/w/h values for sidebar label, first item, active item, main heading, and TOC title before final handoff.

## Related Issues

- [Shadcn docs restarts need a keep/throw comparison first](../best-practices/2026-05-23-shadcn-docs-restart-comparison.md)
- [Shadcn header nav needs locale-safe client links](./2026-05-24-shadcn-header-nav-needs-locale-safe-client-links.md)
