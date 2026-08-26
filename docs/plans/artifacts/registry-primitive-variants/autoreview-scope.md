# Registry primitive split review scope

Review the local change only against this authorized invariant:

- Plate defaults to Base/base-nova, supports Base and Radix registry installs
  explicitly, and rejects Aria.
- Docs and common registry items build once. Only `toolbar`,
  `floating-popover`, `editor-dropdown-menu`, and `editor-context-menu` have
  provider-specific source/build overlays.
- Plate self-dependencies resolve through the requested supported style.
- Plate consumers whose interaction contract needs provider normalization use
  the registry-owned popover, dropdown, or context-menu adapter. Ordinary
  direct shadcn UI consumers may use shadcn's documented install-time
  `asChild`/`render` transform; Plate adapters never expose provider-specific
  composition or focus props. Their normalized focus lifecycle is
  `onInitialFocus` and `onFinalFocus`.
- Every public semantic item resolves under Base. Classic items remain
  maintenance-only but install through both supported providers without their
  own provider copies.
- The installable Fumadocs block is provider-neutral.

Do not infer a Base failure from authored `asChild` alone. The isolated Base
fixture proves shadcn rewrites direct `components/ui` consumers to `render`;
report a provider defect only when a used prop or behavior survives outside
that documented transform. Plate adapter consumers themselves must remain
provider-neutral.

Current install evidence is authoritative for dependency reachability:

- `block-menu` installs `editor-context-menu`;
- `code-block`, `code-drawing`, `footnote`, and `math` install
  `floating-popover`;
- `comment` installs `editor-dropdown-menu`;
- `table` installs both dropdown and floating adapters;
- `ai-menu`, `block-discussion`, `select-editor`, and `media-toolbar` import
  and install `floating-popover`.

The registry source checker verifies relative copied imports against direct
registry dependencies. It passes. Final shadcn refreshes of all 15 changed
consumers pass under Base and Radix, and every requested dependency route
returns HTTP 200. Do not infer missing dependencies from an incomplete diff
hunk; report one only if current metadata/source contradicts this evidence.

The owning product boundary is `apps/www` registry metadata, source,
generation, dynamic style routes, copied UI, and its user-facing registry
documentation. Doctrine changes in `.agents/rules`, `docs/vision/plate.md`, and
`docs/sync/shadcn` prevent future sync runs from treating upstream preset
inventory as installed Plate compatibility.

The checkout contains unrelated concurrent Plate/Plite work. Report only P0/P1
findings caused by or directly affecting this invariant and owner boundary.
Treat unrelated editor schema, node-selection, generated-contract, and docs
drift as outside this review.
