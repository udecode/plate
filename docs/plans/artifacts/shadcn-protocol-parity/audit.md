# Shadcn protocol parity audit

## Verdict

Plate's registry protocol is healthy, but Base-first is not end to end.

The registry itself follows shadcn 4.19.0 correctly: Base is canonical,
Radix is a complete supported alternative, dependencies resolve through the
consumer's style, and unsupported providers fail closed. All 380 public items
parse and all 6,858 supported item/style responses resolve.

The serious gap is the template boundary. Both checked-in templates still say
`style: new-york` and use the legacy style-less `@plate` URL. The next local
template sync therefore combines a Base Plate adapter with Radix shadcn UI.
An exact CLI install rendered an empty dropdown trigger. That is a P1 generator
defect, not theoretical drift.

Luma, Lyra, Nova, Vega, Maia, Mira, Sera, and Rhea are style presets. They do
not need physical Plate variants. Four direct interaction owners need Base and
Radix authors; copying all registry items would be architecture bloat.

## Evidence boundary

| Source         | Exact boundary                                                          | Use                                                                                                                                       |
| -------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Plate          | current filesystem on `168a4490e2ccf90dd9b1bd3230fb2f528460caa2`        | Current registry, generated payload, template, and sync behavior. Base-first work is local, so the commit alone is not the audited state. |
| shadcn current | `../shadcn` `origin/main` at `b9938d94635fca7a4560449713b0b1ba87d77bc6` | Current external protocol owner.                                                                                                          |
| shadcn release | `shadcn@4.19.0` at `1773ecfeeb4a04366978d353e69b5c7ded78dcb2`           | Exact CLI version pinned by `apps/www`.                                                                                                   |
| npm            | `shadcn` latest was `4.19.0` on 2026-08-25                              | Establishes that today's floating template generator happens to equal the pin.                                                            |

The only registry-protocol file changed between the 4.19.0 tag and current
`origin/main` is `packages/shadcn/src/registry/github-auth.ts`. Plate does not
use that path. Schema, resolver, configuration, preset, and transform behavior
match the installed 4.19.0 package.

## Contract matrix

| Contract                      | Upstream owner                                   | Plate owner                                                                | Classification                                 | Evidence                                                                                                                                                           |
| ----------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Registry schema               | `packages/shadcn/src/registry/schema.ts`         | `apps/www/src/registry/registry.ts`, `apps/www/scripts/build-registry.mts` | Exact parity                                   | Plate imports `Registry`, `RegistryItem`, and `registrySchema` from `shadcn/schema`; all current public payloads parse.                                            |
| Strict `components.json`      | `schema.ts`, `utils/get-config.ts`               | `plate-registry-config.ts`, three checked-in `components.json` files       | Partial                                        | Plate's init owner is schema-valid. Both templates are valid but select the wrong provider and URL contract.                                                       |
| Bare dependency input         | `registry/builder.ts`, `registry/resolver.ts`    | Registry item `registryDependencies`                                       | Exact parity                                   | Bare names remain shadcn dependencies and resolve through `styles/{config.style}`. Plate does not invent `@shadcn/*`.                                              |
| Namespaced input              | `builder.ts`, `resolver.ts`                      | `PLATE_REGISTRY_NAMESPACE`, `PLATE_REGISTRY_URL`                           | Exact parity                                   | `@plate/foo` expands through `https://platejs.org/r/{style}/{name}.json`; an unconfigured namespace fails upstream.                                                |
| Absolute URL input            | `registry/utils.ts`, `resolver.ts`               | Public and development install commands                                    | Exact parity                                   | URLs bypass namespace expansion and are parsed by upstream item schema.                                                                                            |
| Local-file input              | `registry/utils.ts`, `resolver.ts`               | `prepare-local-template-registry.mjs`                                      | Intentional Plate delivery adapter             | Plate mirrors recursive self-dependencies to sibling JSON files, then lets upstream shadcn resolve them. No localhost server is required.                          |
| Source self-dependencies      | Upstream recursive resolver                      | `registry-dependencies.mts`, source checker                                | Exact parity                                   | Source uses explicit `@plate/*`; copied shadcn UI dependencies stay bare.                                                                                          |
| Public self-dependencies      | Upstream URL resolver                            | `build-registry.mts`, `registry-response.ts`                               | Intentional Plate delivery                     | Generated dependencies use same-base absolute URLs; style routes rewrite every Plate URL to the requested style.                                                   |
| Init preset                   | Upstream `registry:base` schema and init command | `/init`, `plate-init.ts`                                                   | Exact parity                                   | Plate emits a parsed `registry:base`, `extends: none`, `base-nova`, the style-aware registry URL, and `@plate/editor-basic`.                                       |
| Default provider/style        | Upstream preset contract                         | `plate-registry-styles.ts`                                                 | Exact parity for Plate's supported set         | Base and `base-nova` are explicit defaults. Legacy `new-york*` maps to Radix.                                                                                      |
| Provider support              | Upstream bases are Base, Radix, and Aria         | `plate-registry-styles.ts`, `registry-response.ts`                         | Intentional divergence                         | Plate proves Base and Radix completely. Aria and unknown styles return no payload instead of silently falling back.                                                |
| Style presets                 | `preset/preset.ts`                               | `plate-registry-styles.ts`                                                 | Exact parity                                   | Plate derives all eight style names from `PRESET_STYLES`; styles select tokens and provider routing, not physical Plate source copies.                             |
| Provider source ownership     | Upstream Base transforms plus provider UI        | `registry-variants.ts`                                                     | Intentional Plate architecture                 | Exactly four physical owners translate behavior: context menu, dropdown menu, toolbar, and floating popover.                                                       |
| Canonical build               | Upstream `shadcn build`                          | `build-registry.mts`, `registry-build-targets.mts`                         | Exact protocol, Plate-owned layout             | One Base graph builds under `public/r` or `public/rd`; one four-item Radix overlay builds under `src/__registry__/radix`.                                          |
| Dynamic style delivery        | Upstream `{style}` substitution                  | `registry-response.ts`                                                     | Exact parity                                   | All 18 supported styles select Base or Radix, replace overlay owners when needed, and rewrite recursive Plate URLs.                                                |
| Root `/r/{name}.json`         | Raw URL semantics                                | Canonical Base output                                                      | Intentional default with migration requirement | Raw style-less URLs install Base. Pairing that URL with a legacy Radix `components.json` is unsafe; both Plate templates currently do this.                        |
| Development clipboard URL     | Raw URL semantics                                | `registry-install.ts`, Next redirects                                      | Exact parity                                   | `/rd/foo` redirects to `/rd/foo.json`; direct development installs use the canonical Base graph.                                                                   |
| Registry directory and MCP    | Upstream registry discovery                      | `/r/registries.json`, MCP docs/dialog                                      | Exact parity                                   | Directory and teaching use the style-aware `@plate` URL; LLM registry links point directly at `base-nova`.                                                         |
| Template configuration        | Consumer `components.json`                       | `templates/*/components.json`                                              | **Proven defect**                              | Both templates differ from the init owner only at `style` and `registries`: `new-york` plus `/r/{name}.json` instead of `base-nova` plus `/r/{style}/{name}.json`. |
| Template convergence          | Upstream `shadcn add -o`                         | `update-template.sh`                                                       | **Proof debt / deterministic residue**         | The script updates and overwrites reachable files but never removes packages or files that leave the generated closure.                                            |
| Base source transforms        | `transform-aschild.ts`, `transform-render.ts`    | Direct shadcn UI consumers                                                 | Exact parity                                   | Upstream transforms direct `asChild`/`render` syntax for `base-*`. Plate adapters keep physical variants only where behavior remains provider-bound.               |
| Unsupported provider behavior | No Plate graph exists for Aria                   | `getPlateRegistryStyleBase`                                                | Exact Plate fail-closed policy                 | `aria-*` does not alias to Base or Radix.                                                                                                                          |

Every named row is classified. There are zero unreviewed contract rows.

## Ranked findings

### P1 — Template sync installs an invalid mixed-provider graph

This is a proven defect in the current generation path.

- `templates/plate-template/components.json` and
  `templates/plate-playground-template/components.json` select `new-york` and
  `https://platejs.org/r/{name}.json`.
- The style-less Plate URL serves the canonical Base adapter. Bare shadcn UI
  dependencies use the template's `new-york` style and therefore serve Radix.
- A real shadcn 4.19.0 local-file install selected the Base
  `editor-dropdown-menu` adapter and the Radix `dropdown-menu` primitive.
- Server rendering produced:

  ```html
  <button
    ...
    data-slot="dropdown-menu-trigger"
    render="[object Object]"
  ></button>
  ```

  The requested `<span>Open</span>` child disappeared because a Base `render`
  prop reached a Radix trigger.

- `plate-init.test.ts` calls itself template alignment proof but reads neither
  template. It only reasserts the desired in-memory values, so it stays green
  while both templates disagree.

The directly proven blast radius is the next local sync of both checked-in
templates. Any external Radix project that retained Plate's old style-less
registry URL has the same resolver topology, but this audit did not measure
external usage.

**Required repair:** make the shared Plate config owner generate or verify both
template configs before shadcn runs. Set `base-nova` and the style-aware URL,
then add an exact template-config test plus one mixed-provider regression
fixture. Patching two JSON files without an owner check merely resets the clock.

### P2 — Template refresh is additive, not convergent

This is deterministic residue, although the exact unused set after a full
Base refresh was not measured here.

`update-template.sh` runs `bun update --latest`, then `shadcn add -o`, then
format/type checks. It has no managed-file deletion and no dependency pruning.
The current basic template declares five Radix packages and has four
Radix-importing source files. The playground declares twelve and has twenty-six.
A Base refresh can add or overwrite the new closure, but this script cannot
prove the old provider closure is gone.

**Required repair:** define the registry-managed file and package boundary,
generate that boundary from an empty temporary target, and reconcile it into
the template. Keep manual template files outside that owned set. An ever-growing
in-place install is not a reproducible template generator.

### P2 — Provider completeness is enumerated but not guarded by discovery

Current source is clean: direct Base/Radix imports are limited to the four
registered owners, and the prior exhaustive audit classified all production
registry files. The permanent test only iterates
`EDITOR_REGISTRY_VARIANTS`; it does not fail when a future unregistered file
adds `@base-ui/react`, `@radix-ui/*`, or `radix-ui` directly.

**Required repair:** promote the direct-provider import scan into the normal
registry source checker. Assert that every direct provider import belongs to a
registered paired owner and that both author files exist.

### P3 — Generator reproducibility depends on today's npm tag

The registry builder and focused tests pin shadcn 4.19.0. Template refresh and
root template tests invoke `shadcn@latest`. Today those are the same version,
so this is not a current defect. A future npm release can change generated
source before Plate has audited the protocol.

**Required repair:** pin the generator used for committed template output.
Keep a separate latest-version canary if early drift detection is wanted.
User-facing `npx shadcn@latest` instructions should remain current-channel
commands.

## Intentional divergences and false alarms

- **No all-item provider copies.** Only four direct interaction owners justify
  Base/Radix authors. Assemblies and provider-neutral source stay canonical.
- **No Luma/Lyra variants.** The eight names are visual presets, not component
  providers.
- **No Aria fallback.** Upstream advertising an Aria preset does not prove
  Plate's 380-item graph. Returning no payload is the correct current contract.
- **`apps/www/components.json` may remain `new-york`.** It configures the
  registry authoring application, not a shipped Plate consumer or the custom
  Base canonical build.
- **The style-less root route is valid raw input.** It intentionally means
  canonical Base. The bug is retaining it inside a Radix consumer config.
- **The relative-import and React Day Picker normalizers are legitimate Plate
  sync adapters.** They are not resolver forks, although direct tests would
  improve their proof.
- **Extensionless development commands are valid.** Next redirects `/rd/foo`
  to `/rd/foo.json` before the static registry payload is read.
- **Current upstream main does not require another sync.** Its only post-4.19
  registry change is GitHub authentication, outside Plate's setup path.

## Options and recommendation

| Option                                                                                     | Decision                   | Reason                                                                                                         |
| ------------------------------------------------------------------------------------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Patch both template JSON files                                                             | Reject as the complete fix | Repairs the immediate values but leaves two independent copies and the false-green test.                       |
| Share/derive the template config, generate a clean managed closure, and add resolver proof | **Recommend**              | Fixes the owner, prevents provider mixing, and makes repeated syncs converge.                                  |
| Generate every Plate item for every provider/style                                         | Reject                     | Multiplies provider-neutral source and confuses visual presets with runtime providers.                         |
| Keep templates on Radix                                                                    | Reject                     | Contradicts the accepted Base-first default and leaves Plate's own starting points behind the public contract. |

The repair should be one narrow template/protocol packet. It does not require
another broad `$sync-shadcn` run.

## Verification

| Check                               | Result                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `pnpm view shadcn version --json`   | `4.19.0`; matches `apps/www` pin.                                                                                  |
| Upstream tag-to-main protocol diff  | Only `registry/github-auth.ts`.                                                                                    |
| Focused Bun suite from `apps/www`   | 32 passed, 0 failed, 829 assertions.                                                                               |
| `scripts/check-registry-source.mts` | Passed.                                                                                                            |
| Current generated payload schemas   | 380 unique public items; registry and docs indexes parse.                                                          |
| Dynamic route matrix                | 6,858/6,858 responses: 18 supported styles × 381 item/index requests.                                              |
| Canonical provider scan             | Zero Radix imports; only `toolbar` and `floating-popover` declare `@base-ui/react`.                                |
| Sparse overlay scan                 | Four items; zero Base imports.                                                                                     |
| Template config comparison          | Both templates mismatch only `style` and `registries`.                                                             |
| Real shadcn dry run                 | Base Plate dropdown adapter plus Radix shadcn dropdown.                                                            |
| Exact runtime fixture               | Trigger child missing; `render="[object Object]"` leaked to Radix DOM.                                             |
| Existing all-item consumer proof    | Prior current-tree artifact records 380/380 Base and 380/380 Radix installs with zero provider-only compiler rows. |

The first focused test attempt ran from the repository root and produced five
`registry-response` failures because those tests intentionally resolve paths
from `apps/www`. Re-running from the owning application passed all 32 tests.
Other corrected command-shape errors did not change the classifications.

## Pressure pass and limits

- **Counterexample: the template mismatch is intentional legacy support.**
  Rejected. The shared init owner, docs, directory endpoint, Base canonical
  build, and accepted default all say `base-nova` plus a style-aware URL. The
  exact CLI/runtime fixture proves material harm.
- **Counterexample: upstream transforms should repair the mix.** Rejected.
  Base transforms run for `base-*`; `new-york` selects Radix and leaves the
  already-Base Plate adapter unchanged.
- **Counterexample: all current Radix packages will certainly be unused after
  refresh.** Not claimed. The proven fact is that the sync has no mechanism to
  establish or prune the final closure.
- **Counterexample: `shadcn@latest` is already broken.** Rejected. It resolves
  to the pinned 4.19.0 today; this is future reproducibility debt only.

This audit proves the current local protocol and an isolated generated runtime
failure. It does not prove production deployment state, published template
state, external consumer prevalence, or a final pushed ref. No product,
generated registry, template, package, git, tracker, or remote state was
changed.
