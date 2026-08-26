# Plate registry provider audit

## Verdict

Base is Plate's default registry provider. All 380 public Plate registry items
install under Base and Radix.

Plate has four physical provider-variant owners:

1. `editor-context-menu`
2. `editor-dropdown-menu`
3. `floating-popover`
4. `toolbar`

The public graph stays semantic. Assemblies, classic items, preset styles, and
provider-neutral source do not get provider copies.

The item-level Radix-only policy was wrong. A supported provider is a complete
install target. Provider differences belong at the direct interaction owner;
routes must not hide affected items.

## Exhaustive coverage

`audit.mts` generates the registry manifest. `compatibility.mts` compares
imported shadcn UI symbols across providers and catalogs the props used at each
call site. `decisions.mts` assigns every item and source file one current
decision.

| Boundary | Reviewed | Unclassified |
| --- | ---: | ---: |
| Active registry items | 435 | 0 |
| Plate items | 235 | 0 |
| Docs items | 200 | 0 |
| Unique active item file paths | 451 | 0 |
| Production registry source files | 323 | 0 |
| Published or provider-variant source files | 256 | 0 |
| Public item payloads | 380 | 0 |

### Item classification

| Classification | Count |
| --- | ---: |
| Primitive-agnostic | 286 |
| Primitive-transitive | 92 |
| Direct shadcn UI consumer | 51 |
| Direct primitive package owner | 2 |
| Plate style item | 3 |
| Independent third-party primitive | 1 |
| Total | 435 |

### Source-file classification

| Classification | Count |
| --- | ---: |
| Primitive-agnostic | 269 |
| Direct shadcn UI consumer | 49 |
| Direct primitive package owner | 4 |
| Independent third-party primitive | 1 |
| Total | 323 |

The four provider owners have eight author files: four Base files under
`bases/base/editor` and four Radix files under `components/editor`. Each pair
installs to one flat `components/editor/*` target.

The two installed-target collisions are intentional alternative blocks:

- `@components/editor/plate-editor.tsx`: `editor-ai` or `editor-basic`
- `app/editor/page.tsx`: `editor-ai`, `editor-basic`, or `editor-select`

## Provider contract

| Concern | Contract |
| --- | --- |
| Default base | `base` |
| Default style | `base-nova` |
| Supported bases | `base`, `radix` |
| Supported preset styles | `nova`, `vega`, `maia`, `lyra`, `mira`, `luma`, `sera`, `rhea` |
| Legacy styles | `new-york` and `new-york-v4` resolve to Radix |
| Unsupported styles | `aria-*` and unknown styles return no payload |
| Canonical build | Base graph under `public/r` or `public/rd` |
| Sparse overlay | Radix contains the four provider-owner items only |
| Public item id | One semantic id independent of provider |
| Installed target | One flat target independent of provider |

The root `/r/{name}.json` output is Base because Base owns the canonical build.
Explicit style routes choose Base or Radix. Presets choose tokens and provider
routing; they do not multiply Plate source.

This matches shadcn 4.19: default initialization writes `style: base-nova`.
The explicit CLI form is `--base base --preset nova`.

## Physical provider owners

- `toolbar` translates Base UI Toolbar/Tooltip and Radix Toolbar/Tooltip into
  one Plate-facing component contract.
- `floating-popover` translates Base UI Popover and Radix Popover trigger,
  anchor, focus, and content behavior.
- `editor-dropdown-menu` translates `render` versus `asChild` and exposes one
  `onFinalFocus` lifecycle over both provider focus APIs.
- `editor-context-menu` translates root modality, trigger composition, and
  `onFinalFocus` behavior while keeping consumer imports flat.

The Base toolbar retains Plate's `onOverlayOpenChange`, focus-preserving mouse
behavior, and keyboard/pointer overlay reporting. Type compatibility alone
would not have caught that behavior gap.

An ordinary direct `components/ui` consumer may retain shadcn's documented
Radix author syntax. The Base installer rewrites `asChild` to `render`; that
install-time transform does not make the Plate item a physical provider owner.
Plate adapters exist where focus, behavior, or props remain different after
that upstream transform. Calls to a Plate adapter never expose provider syntax.

Provider-neutral call sites also avoid unsupported provider-specific props:

- Emoji does not set Radix-only tooltip delay props.
- Footnote does not set Radix-only hover-card delay props.
- Code drawing validates nullable or string select values against its domain.
- Math, table, code block, and font size compose triggers through the Plate
  adapters instead of exposing provider composition props.

## Classic items

The registry contains 11 classic items. Ten are public install items;
`list-classic-demo` is an internal preview.

Classic remains maintenance-only, but every public classic item installs under
both providers. Two leaf files lost accidental Radix coupling:

- `insert-toolbar-classic-button` does not name the Radix dropdown root type.
- `turn-into-toolbar-classic-button` uses the selected shadcn radio item as the
  indicator owner.

No classic item needs a provider copy. Its dependency graph reaches the four
direct provider owners.

## Other primitive decisions

The installable `fumadocs` block is provider-neutral. Native `details` and
`summary` own disclosure, while the selected shadcn `separator` item owns the
separator. It declares no Radix package.

`inline-combobox` keeps Ariakit. Ariakit is an explicit feature dependency,
not a shadcn provider variant.

Aria remains unsupported. An upstream preset name is only a candidate; Plate
support requires complete installed-graph proof.

## Compatibility proof

The static shadcn UI export comparison covers:

| Measure | Result |
| --- | ---: |
| Direct shadcn UI items | 51 |
| UI modules | 20 |
| Imported symbol and prop-catalog rows | 179 |
| Missing imported symbols | 0 |
| Modules with missing symbols | 0 |

This static comparison proves symbol availability, not prop compatibility.
The isolated compiler fixture owns the prop proof.

The final shadcn 4.19 Vite fixtures prove:

- all 380 public items install under `base-nova`;
- all 380 public items install under `radix-nova`;
- the four installed Base adapter owners typecheck together;
- the four installed Radix adapter owners typecheck together;
- normalized full-consumer `tsc -b` diagnostics have zero Base-only and zero
  Radix-only rows.

The fixtures packed 53 exact local package artifacts from current `dist` and
used no TypeScript path or source alias back to the checkout. The full
consumers retain 197 identical current-tree/host diagnostics on each provider,
including generated selection API drift, missing Next/Fumadocs host packages,
and no-unused checks. Those rows do not differ by provider.

The initial fixture command `tsc --noEmit` was false green because the Vite
root config contains project references but no source files. Re-running the
real `tsc -b` build exposed the provider prop gaps and drove the four-owner
design. `consumer-proof.md` records the exact boundary.

`registry-response.test.ts` resolves all 380 public payloads through
`base-nova`. It also proves every public classic item, the complete Base index,
explicit Radix overlays, legacy Radix aliases, and unsupported-style rejection.

## Additional gaps found and fixed

| Gap | Decision |
| --- | --- |
| Base routes filtered 11 classic names | Delete the filter; completeness is provider-level |
| Plate defaulted to Radix/new-york | Make Base/base-nova explicit defaults |
| Canonical output was Radix | Make Base canonical and Radix the sparse overlay |
| Variant item names were duplicated in build and route code | Move provider metadata to `registry-variants.ts` |
| The first audit named only toolbar and floating popover | Add compiler-discovered dropdown and context menu owners |
| Dropdown/context call sites exposed Radix focus and composition props | Add four paired provider adapters and route consumers through them |
| First adapter draft retained Radix `onOpenAutoFocus`/`onCloseAutoFocus` names | Expose provider-neutral `onInitialFocus`/`onFinalFocus` lifecycle callbacks |
| Trigger call sites retained `asChild` behind Plate adapters | Remove it so shadcn cannot rewrite Plate adapter calls |
| Base Tooltip, HoverCard, and Select props differed | Use provider-neutral call sites and domain validation |
| Two classic leaves imported Radix contracts | Make them provider-neutral |
| Fumadocs bundled Radix Accordion and Separator | Use native disclosure and shadcn Separator |
| Base Toolbar missed `onOverlayOpenChange` behavior | Port the Plate-facing behavior to the Base author source |
| LLM, docs, checks, and init config taught `new-york` | Point default teaching and checks at `base-nova` |
| `siteConfig.registryUrl` was unused and hardcoded to Radix | Delete it |
| Old provider output could survive build inversion | Clean every supported provider output before generation |
| Production tracing named the deleted Base staging directory | Trace canonical `public/r` plus the sparse Radix overlay |
| Root fixture `tsc --noEmit` checked no source | Use `tsc -b` plus focused adapter projects |

## Rejected shape

Do not create Base copies of assemblies or one provider directory per preset.
That duplicates composition while hiding the direct interaction owner. Sparse
variants at the four direct owners are the complete target.

Do not call every registry item a primitive. Most items are assemblies or
provider-neutral copied source. Only the four owners above translate provider
contracts.

## Remaining proof gates

None task-owned. The third and final P1 autoreview found no P0/P1 defect in the
authorized provider scope and rated the patch correct with 0.91 confidence.

Docs/source checks, Browser proof, registry changelog generation, rule-mirror
sync, and sync-status accounting are complete. `pnpm --filter www check:docs`
still reports the unrelated stale API-reference manifest; the broad www
typecheck still reports unrelated current-tree Plite selection drift.
