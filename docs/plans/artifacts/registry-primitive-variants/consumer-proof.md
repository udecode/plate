# Isolated registry consumer proof

## Boundary

- shadcn CLI: `4.19.0`
- styles: `base-nova` and `radix-nova`
- public Plate items per style: 380
- local Plate package tarballs: 53 exact artifacts from current `dist`
- TypeScript aliases back to the checkout: none
- source aliases back to the checkout: none

The temporary consumers lived under
`/tmp/plate-base-first-fixture.9J5Zrl/{base,radix}`. They are evidence fixtures,
not repository inputs.

## Results

| Proof | Base | Radix |
| --- | ---: | ---: |
| Install all 380 public items | pass | pass |
| Typecheck the four provider adapter owners | pass | pass |
| Unique full `tsc -b` diagnostics | 197 | 197 |
| Provider-only diagnostics after path normalization | 0 | 0 |

The focused compiler projects include the installed `context-menu`,
`dropdown-menu`, `floating-popover`, and `toolbar` files plus their imported
source closure.

The full diagnostic sets are identical after replacing only the fixture root
path. Shared failures include current generated selection API drift, missing
Next/Fumadocs host dependencies in the generic Vite host, and no-unused checks.
They are not Base or Radix compatibility differences.

## False-green correction

`tsc --noEmit` at the Vite root checked no application source because the root
config contains only project references. `tsc -b` is the real consumer build.
It initially exposed Base-only ContextMenu, DropdownMenu, Popover, Tooltip,
HoverCard, Select, math trigger, and table trigger incompatibilities.

After the provider adapters and neutral call-site fixes, the normalized
symmetric diagnostic diff is empty.

## Install-transform boundary

The installed Base copy of `insert-toolbar-classic-button` proves shadcn's
supported source transform: its authored `DropdownMenuTrigger asChild` becomes
a Base `render={<ToolbarButton ... />}` trigger. The Radix installation retains
`asChild`. Both consumers compile to the same diagnostic set.

This direct `components/ui` usage is not a Plate provider owner. A Plate
adapter is required only when behavior, focus, or props remain provider-bound
after shadcn's transform. Plate adapter consumers never expose `asChild` or
`render` themselves.

## Final provider-surface refresh

After the adapter focus API became `onInitialFocus` / `onFinalFocus`, shadcn
successfully reinstalled the 15 changed semantic consumers and their dependency
closures into both existing all-item fixtures. The refreshed payloads include
every required `editor-context-menu`, `editor-dropdown-menu`, and
`floating-popover` target; no relative adapter import is missing.

The focused provider-surface compiler includes the four adapters plus all 15
changed consumers. Base and Radix each report 21 diagnostic sites, with zero
provider-only sites after path normalization. Every site is shared current-tree
or generic Vite-host drift; none names an adapter focus prop or a missing
adapter module.
