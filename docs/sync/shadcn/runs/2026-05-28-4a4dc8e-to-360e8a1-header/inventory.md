# Header-Scoped Shadcn Inventory 4a4dc8e..360e8a1

Scope: `header`

This inventory is fresh for the current `../shadcn` target and accounts for every row in `upstream-name-status.tsv`. Rows outside the user-named `header` scope are retained for count reconciliation and marked `out-of-scope`.

## Counts

### Scope Counts

| Scope | Count |
| --- | ---: |
| `direct-header` | 5 |
| `header-adjacent` | 2 |
| `out-of-scope` | 732 |

### Status Counts

| Status | Count |
| --- | ---: |
| `A` | 561 |
| `D` | 22 |
| `M` | 156 |

### Subsystem Counts

| Subsystem | Count |
| --- | ---: |
| `assets` | 2 |
| `deps-config` | 2 |
| `docs-engine` | 2 |
| `other` | 4 |
| `product-page` | 66 |
| `registry-build` | 31 |
| `routing` | 2 |
| `shell-nav-sidebar` | 7 |
| `theme-style` | 623 |

### Decision Counts

| Decision | Count |
| --- | ---: |
| `exclude-upstream` | 672 |
| `no-op` | 62 |
| `plate-fork` | 3 |
| `smart-merge` | 2 |

## Inventory

| Status | Upstream file | Scope | Subsystem | Plate owner | Decision | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| A | `apps/v4/app/(app)/(root)/cards/account-access.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/analytics-card.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/claimable-balance.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/contribution-history.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/dividend-income.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/empty-distribute-track.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/index.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/new-milestone.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/notification-settings.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/payments.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/payout-threshold.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/power-usage.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/qr-connect.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/savings-targets.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/sidebar-nav.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/skeleton/account-access.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/skeleton/analytics-card.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/skeleton/claimable-balance.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/skeleton/contribution-history.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/skeleton/dividend-income.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/skeleton/empty-distribute-track.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/skeleton/index.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/skeleton/new-milestone.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/skeleton/notification-settings.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/skeleton/payments.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/skeleton/payout-threshold.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/skeleton/power-usage.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/skeleton/qr-connect.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/skeleton/savings-targets.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/skeleton/sidebar-nav.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/skeleton/transfer-funds.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/skeleton/ui-elements.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/transfer-funds.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(app)/(root)/cards/ui-elements.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| D | `apps/v4/app/(app)/(root)/components/appearance-settings.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| D | `apps/v4/app/(app)/(root)/components/button-group-demo.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| D | `apps/v4/app/(app)/(root)/components/button-group-input-group.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| D | `apps/v4/app/(app)/(root)/components/button-group-nested.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| D | `apps/v4/app/(app)/(root)/components/button-group-popover.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| D | `apps/v4/app/(app)/(root)/components/empty-avatar-group.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| D | `apps/v4/app/(app)/(root)/components/empty-input-group.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| D | `apps/v4/app/(app)/(root)/components/field-checkbox.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| D | `apps/v4/app/(app)/(root)/components/field-choice-card.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| D | `apps/v4/app/(app)/(root)/components/field-demo.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| D | `apps/v4/app/(app)/(root)/components/field-hear.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| D | `apps/v4/app/(app)/(root)/components/field-slider.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| D | `apps/v4/app/(app)/(root)/components/index.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| D | `apps/v4/app/(app)/(root)/components/input-group-button.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| D | `apps/v4/app/(app)/(root)/components/input-group-demo.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| D | `apps/v4/app/(app)/(root)/components/input-group-textarea.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| D | `apps/v4/app/(app)/(root)/components/item-avatar.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| D | `apps/v4/app/(app)/(root)/components/item-demo.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| D | `apps/v4/app/(app)/(root)/components/notion-prompt-form.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| D | `apps/v4/app/(app)/(root)/components/spinner-badge.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| D | `apps/v4/app/(app)/(root)/components/spinner-empty.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `no-op` | Deleted upstream root demo component with no Plate header owner. |
| M | `apps/v4/app/(app)/(root)/page.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| M | `apps/v4/app/(app)/create/components/customizer.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| M | `apps/v4/app/(app)/create/components/design-system-provider.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| M | `apps/v4/app/(app)/create/components/radius-picker.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| M | `apps/v4/app/(app)/create/hooks/use-locks.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| M | `apps/v4/app/(app)/create/lib/fonts.ts` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| M | `apps/v4/app/(app)/create/lib/randomize-biases.ts` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| M | `apps/v4/app/(app)/docs/[[...slug]]/page.tsx` | `out-of-scope` | `other` | none | `no-op` | Outside `header` scope; retained in full range accounting only. |
| M | `apps/v4/app/(app)/docs/changelog/page.tsx` | `out-of-scope` | `other` | none | `no-op` | Outside `header` scope; retained in full range accounting only. |
| M | `apps/v4/app/(create)/preview/[base]/[name]/page.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(create)/preview/font-variables.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(create)/preview/fonts.ts` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| A | `apps/v4/app/(create)/preview/layout.tsx` | `out-of-scope` | `product-page` | Plate homepage/create policy | `exclude-upstream` | Out of `header` scope and excluded by create/homepage policy. |
| M | `apps/v4/app/globals.css` | `out-of-scope` | `other` | none | `no-op` | Outside `header` scope; retained in full range accounting only. |
| M | `apps/v4/app/layout.tsx` | `direct-header` | `shell-nav-sidebar` | apps/www/src/app/layout.tsx | `no-op` | Plate already has `lg:[--header-height:calc(var(--spacing)*16)]` and no `localStorage.layout`/`LayoutProvider`; see layout.tsx:92-118. |
| M | `apps/v4/app/legacy-themes.css` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/app/r/registries.json/route.ts` | `out-of-scope` | `routing` | Plate registry route policy | `no-op` | Out of `header` scope; registry directory route is tracked by the full sync plan. |
| A | `apps/v4/app/style-registry.css` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/components/announcement.tsx` | `header-adjacent` | `shell-nav-sidebar` | Plate homepage/header announcement policy | `exclude-upstream` | Rhea announcement/product copy, not Plate header chrome; current policy excludes Rhea/create/theme surfaces. |
| M | `apps/v4/components/command-menu.tsx` | `direct-header` | `shell-nav-sidebar` | apps/www/src/components/command-menu.tsx | `smart-merge` | Upstream changed the header search trigger to borderless `bg-muted`; Plate trigger still uses `bg-muted/50` and command-menu work was explicitly deferred; see command-menu.tsx:296-311. |
| M | `apps/v4/components/docs-sidebar.tsx` | `header-adjacent` | `shell-nav-sidebar` | apps/www/src/components/docs-nav.tsx | `smart-merge` | Sidebar polish is adjacent but not `header`; keep in sidebar lane, where Plate owns accordion behavior. |
| M | `apps/v4/components/mobile-nav.tsx` | `direct-header` | `shell-nav-sidebar` | apps/www/src/components/mobile-nav.tsx | `plate-fork` | Upstream removed static Home because Home moved into shadcn navItems; Plate intentionally keeps Home in command/mobile items because the logo is hidden on mobile; see mobile-nav.tsx:55-143. |
| M | `apps/v4/components/site-header.tsx` | `direct-header` | `shell-nav-sidebar` | apps/www/src/components/site-header.tsx | `plate-fork` | Keep Plate logo, Docs/Editors/Templates, GitHub, Discord, language switcher, MCP; upstream create/v0 actions stay excluded; see site-header.tsx:47-103. |
| A | `apps/v4/content/docs/changelog/2026-05-rhea.mdx` | `out-of-scope` | `docs-engine` | Plate docs content policy | `exclude-upstream` | Out of `header` scope and excluded as Rhea/create product content. |
| M | `apps/v4/content/docs/registry/registry-index.mdx` | `out-of-scope` | `docs-engine` | Plate docs content policy | `no-op` | Out of `header` scope; docs/content remains Plate-owned. |
| M | `apps/v4/lib/config.ts` | `direct-header` | `shell-nav-sidebar` | apps/www/src/config/site.ts + apps/www/src/components/site-header.tsx | `plate-fork` | Upstream added `Home` to `navItems`; Plate keeps Home in command/mobile nav and keeps desktop Home on the logo only; see site-header.tsx:19-45 and logo.tsx:14-25. |
| M | `apps/v4/lib/fonts.ts` | `out-of-scope` | `deps-config` | Plate app/package config | `no-op` | Out of `header` scope; package/config decisions stay in the full sync plan. |
| M | `apps/v4/package.json` | `out-of-scope` | `deps-config` | Plate app/package config | `no-op` | Out of `header` scope; package/config decisions stay in the full sync plan. |
| A | `apps/v4/public/images/rhea-dark.png` | `out-of-scope` | `assets` | Plate public assets policy | `exclude-upstream` | Out of `header` scope and excluded as Rhea/product asset. |
| A | `apps/v4/public/images/rhea-light.png` | `out-of-scope` | `assets` | Plate public assets policy | `exclude-upstream` | Out of `header` scope and excluded as Rhea/product asset. |
| M | `apps/v4/public/r/config.json` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| D | `apps/v4/public/r/registries.json` | `out-of-scope` | `routing` | Plate registry route policy | `no-op` | Out of `header` scope; registry directory route is tracked by the full sync plan. |
| M | `apps/v4/public/r/styles/base-luma/dialog-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-luma/preview-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-luma/scroll-area-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-luma/sheet-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-luma/sidebar-07.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-luma/tabs-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-luma/toggle-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-lyra/dialog-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-lyra/preview-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-lyra/scroll-area-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-lyra/sheet-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-lyra/sidebar-07.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-lyra/tabs-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-lyra/toggle-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-maia/dialog-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-maia/preview-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-maia/scroll-area-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-maia/sheet-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-maia/sidebar-07.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-maia/tabs-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-maia/toggle-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-mira/dialog-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-mira/preview-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-mira/scroll-area-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-mira/sheet-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-mira/sidebar-07.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-mira/tabs-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-mira/toggle-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-nova/dialog-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-nova/preview-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-nova/scroll-area-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-nova/sheet-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-nova/sidebar-07.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-nova/tabs-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-nova/toggle-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/accordion-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/accordion.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/alert-dialog-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/alert-dialog.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/alert-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/alert.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/aspect-ratio-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/aspect-ratio.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/avatar-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/avatar.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/badge-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/badge.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/breadcrumb-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/breadcrumb.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/button-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/button-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/button-group.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/button.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/calendar-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/calendar.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/card-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/card.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/carousel-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/carousel.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/chart-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/chart.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/checkbox-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/checkbox.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/collapsible-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/collapsible.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/combobox-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/combobox.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/command-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/command.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/component-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/context-menu-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/context-menu.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/dashboard-01.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/demo.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/dialog-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/dialog.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/direction.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/drawer-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/drawer.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/dropdown-menu-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/dropdown-menu.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/empty-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/empty.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/field-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/field.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-dm-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-eb-garamond.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-figtree.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-geist-mono.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-geist.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-dm-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-eb-garamond.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-figtree.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-geist-mono.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-geist.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-ibm-plex-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-instrument-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-instrument-serif.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-inter.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-jetbrains-mono.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-lora.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-manrope.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-merriweather.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-montserrat.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-noto-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-noto-serif.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-nunito-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-outfit.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-oxanium.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-playfair-display.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-public-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-raleway.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-roboto-slab.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-roboto.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-source-sans-3.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-heading-space-grotesk.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-ibm-plex-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-instrument-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-instrument-serif.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-inter.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-jetbrains-mono.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-lora.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-manrope.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-merriweather.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-montserrat.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-noto-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-noto-serif.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-nunito-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-outfit.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-oxanium.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-playfair-display.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-public-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-raleway.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-roboto-slab.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-roboto.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-source-sans-3.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/font-space-grotesk.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/form.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/hover-card-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/hover-card.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/index.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/input-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/input-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/input-group.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/input-otp-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/input-otp.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/input.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/item-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/item.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/kbd-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/kbd.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/label-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/label.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/login-01.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/login-02.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/login-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/login-04.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/login-05.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/menubar-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/menubar.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/native-select-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/native-select.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/navigation-menu-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/navigation-menu.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/pagination-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/pagination.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/popover-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/popover.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/preview-02.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/preview-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/preview.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/progress-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/progress.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/radio-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/radio-group.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/registry.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/resizable-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/resizable.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/scroll-area-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/scroll-area.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/select-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/select.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/separator-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/separator.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sheet-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sheet.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar-01.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar-02.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar-04.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar-05.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar-06.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar-07.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar-08.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar-09.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar-10.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar-11.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar-12.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar-13.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar-14.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar-15.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar-16.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar-floating-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar-icon-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar-inset-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sidebar.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/signup-01.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/signup-02.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/signup-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/signup-04.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/signup-05.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/skeleton-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/skeleton.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/slider-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/slider.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sonner-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/sonner.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/spinner-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/spinner.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/style.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/switch-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/switch.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/table-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/table.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/tabs-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/tabs.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/textarea-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/textarea.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/toggle-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/toggle-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/toggle-group.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/toggle.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/tooltip-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/tooltip.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/use-mobile.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-rhea/utils.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-sera/dialog-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/base-sera/preview-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-sera/scroll-area-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-sera/sheet-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-sera/sidebar-07.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-sera/tabs-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-sera/toggle-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-vega/dialog-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-vega/preview-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-vega/scroll-area-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-vega/sheet-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-vega/sidebar-07.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-vega/tabs-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/base-vega/toggle-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-luma/dialog-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-luma/preview-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-luma/scroll-area-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-luma/sheet-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-luma/sidebar-07.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-luma/sidebar-floating-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-luma/tabs-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-luma/toggle-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-lyra/dialog-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-lyra/preview-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-lyra/scroll-area-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-lyra/sheet-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-lyra/sidebar-07.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-lyra/sidebar-floating-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-lyra/tabs-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-lyra/toggle-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-maia/dialog-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-maia/preview-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-maia/scroll-area-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-maia/sheet-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-maia/sidebar-07.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-maia/sidebar-floating-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-maia/tabs-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-maia/toggle-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-mira/dialog-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-mira/preview-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-mira/scroll-area-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-mira/sheet-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-mira/sidebar-07.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-mira/sidebar-floating-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-mira/tabs-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-mira/toggle-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-nova/dialog-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-nova/preview-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-nova/scroll-area-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-nova/sheet-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-nova/sidebar-07.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-nova/sidebar-floating-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-nova/tabs-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-nova/toggle-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/accordion-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/accordion.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/alert-dialog-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/alert-dialog.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/alert-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/alert.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/aspect-ratio-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/aspect-ratio.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/avatar-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/avatar.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/badge-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/badge.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/breadcrumb-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/breadcrumb.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/button-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/button-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/button-group.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/button.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/calendar-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/calendar.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/card-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/card.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/carousel-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/carousel.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/chart-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/chart.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/checkbox-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/checkbox.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/collapsible-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/collapsible.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/combobox-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/combobox.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/command-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/command.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/component-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/context-menu-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/context-menu.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/dashboard-01.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/demo.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/dialog-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/dialog.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/direction.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/drawer-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/drawer.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/dropdown-menu-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/dropdown-menu.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/empty-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/empty.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/field-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/field.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-dm-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-eb-garamond.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-figtree.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-geist-mono.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-geist.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-dm-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-eb-garamond.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-figtree.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-geist-mono.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-geist.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-ibm-plex-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-instrument-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-instrument-serif.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-inter.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-jetbrains-mono.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-lora.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-manrope.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-merriweather.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-montserrat.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-noto-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-noto-serif.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-nunito-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-outfit.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-oxanium.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-playfair-display.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-public-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-raleway.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-roboto-slab.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-roboto.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-source-sans-3.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-heading-space-grotesk.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-ibm-plex-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-instrument-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-instrument-serif.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-inter.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-jetbrains-mono.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-lora.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-manrope.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-merriweather.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-montserrat.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-noto-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-noto-serif.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-nunito-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-outfit.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-oxanium.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-playfair-display.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-public-sans.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-raleway.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-roboto-slab.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-roboto.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-source-sans-3.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/font-space-grotesk.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/form.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/hover-card-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/hover-card.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/index.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/input-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/input-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/input-group.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/input-otp-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/input-otp.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/input.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/item-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/item.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/kbd-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/kbd.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/label-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/label.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/login-01.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/login-02.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/login-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/login-04.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/login-05.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/menubar-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/menubar.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/native-select-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/native-select.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/navigation-menu-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/navigation-menu.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/pagination-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/pagination.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/popover-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/popover.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/preview-02.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/preview-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/preview.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/progress-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/progress.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/radio-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/radio-group.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/registry.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/resizable-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/resizable.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/scroll-area-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/scroll-area.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/select-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/select.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/separator-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/separator.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sheet-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sheet.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar-01.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar-02.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar-04.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar-05.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar-06.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar-07.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar-08.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar-09.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar-10.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar-11.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar-12.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar-13.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar-14.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar-15.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar-16.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar-floating-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar-icon-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar-inset-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sidebar.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/signup-01.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/signup-02.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/signup-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/signup-04.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/signup-05.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/skeleton-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/skeleton.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/slider-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/slider.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sonner-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/sonner.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/spinner-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/spinner.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/style.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/switch-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/switch.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/table-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/table.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/tabs-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/tabs.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/textarea-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/textarea.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/toggle-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/toggle-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/toggle-group.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/toggle.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/tooltip-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/tooltip.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/use-mobile.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-rhea/utils.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-sera/dialog-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/public/r/styles/radix-sera/preview-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-sera/scroll-area-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-sera/sheet-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-sera/sidebar-07.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-sera/sidebar-floating-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-sera/tabs-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-sera/toggle-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-vega/dialog-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-vega/preview-03.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-vega/scroll-area-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-vega/sheet-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-vega/sidebar-07.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-vega/sidebar-floating-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-vega/tabs-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/r/styles/radix-vega/toggle-group-example.json` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| M | `apps/v4/public/schema.json` | `out-of-scope` | `other` | none | `no-op` | Outside `header` scope; retained in full range accounting only. |
| M | `apps/v4/registry/__index__.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/base/blocks/preview-02/cards/sidebar-nav.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/base/blocks/preview/cards/codespaces-card.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/base/blocks/preview/cards/ui-elements.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/base/blocks/sidebar-07/components/nav-projects.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/base/blocks/sidebar-07/components/nav-user.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/base/blocks/sidebar-07/components/team-switcher.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/base/examples/dialog-example.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/base/examples/scroll-area-example.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/base/examples/sheet-example.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/base/examples/tabs-example.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/base/examples/toggle-group-example.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/radix/blocks/preview-02/cards/sidebar-nav.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/radix/blocks/preview/cards/codespaces-card.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/radix/blocks/preview/cards/ui-elements.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/radix/blocks/sidebar-07/components/nav-projects.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/radix/blocks/sidebar-07/components/nav-user.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/radix/blocks/sidebar-07/components/team-switcher.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/radix/examples/dialog-example.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/radix/examples/scroll-area-example.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/radix/examples/sheet-example.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/radix/examples/sidebar-floating-example.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/radix/examples/tabs-example.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/bases/radix/examples/toggle-group-example.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/config.ts` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/directory.json` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/registry/styles.tsx` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| A | `apps/v4/registry/styles/style-rhea.css` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/scripts/build-registry.mts` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| M | `apps/v4/scripts/validate-registries.mts` | `out-of-scope` | `registry-build` | Plate registry source/build policy | `no-op` | Out of `header` scope; generated/public registry output is not manually imported. |
| A | `apps/v4/styles/base-rhea/ui/accordion.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/alert-dialog.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/alert.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/aspect-ratio.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/avatar.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/badge.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/breadcrumb.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/button-group.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/button.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/calendar.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/card.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/carousel.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/chart.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/checkbox.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/collapsible.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/combobox.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/command.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/context-menu.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/dialog.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/direction.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/drawer.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/dropdown-menu.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/empty.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/field.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/hover-card.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/input-group.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/input-otp.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/input.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/item.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/kbd.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/label.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/menubar.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/native-select.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/navigation-menu.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/pagination.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/popover.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/progress.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/radio-group.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/resizable.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/scroll-area.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/select.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/separator.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/sheet.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/sidebar.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/skeleton.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/slider.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/sonner.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/spinner.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/switch.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/table.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/tabs.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/textarea.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/toggle-group.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/toggle.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/base-rhea/ui/tooltip.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/accordion.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/alert-dialog.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/alert.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/aspect-ratio.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/avatar.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/badge.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/breadcrumb.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/button-group.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/button.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/calendar.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/card.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/carousel.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/chart.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/checkbox.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/collapsible.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/combobox.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/command.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/context-menu.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/dialog.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/direction.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/drawer.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/dropdown-menu.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/empty.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/field.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/hover-card.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/input-group.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/input-otp.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/input.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/item.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/kbd.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/label.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/menubar.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/native-select.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/navigation-menu.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/pagination.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/popover.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/progress.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/radio-group.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/resizable.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/scroll-area.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/select.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/separator.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/sheet.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/sidebar.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/skeleton.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/slider.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/sonner.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/spinner.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/switch.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/table.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/tabs.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/textarea.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/toggle-group.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/toggle.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
| A | `apps/v4/styles/radix-rhea/ui/tooltip.tsx` | `out-of-scope` | `theme-style` | theme/customizer policy | `exclude-upstream` | Out of `header` scope and excluded by theme/customizer policy. |
