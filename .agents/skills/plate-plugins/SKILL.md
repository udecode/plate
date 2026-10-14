---
description: Build or change Plate plugins and packages with semantic ownership, inferred contracts, React adapters and package proof. Use for plugin fields, options, serializers and cross-package features.
name: plate-plugins
metadata:
  skiller:
    source: .agents/rules/plate-plugins.mdc
---

# Plate Plugins

Read `VISION.md`, the current builders in `packages/core/src/lib/plugin` and
`packages/core/src/react/plugin`, and the nearest real package and type tests.
Source and public types outrank a copied recipe.

1. Put non-React semantics in `src/lib`. Use `createSlatePlugin` or
   `createTSlatePlugin` according to the current inferred contract.
2. Lift a semantic base through `toPlatePlugin` or `toTPlatePlugin` in
   `src/react`. A React-only plugin needs an independent React job.
3. Keep one-use behavior with its plugin owner. Extract shared helpers only
   for real reuse or a distinct contract. Follow the owning package's export
   and `internal/` conventions; `pnpm brl` generates barrels.
4. Read current `extendApi`, `extendTransforms`, `overrideEditor`, node,
   handlers, inject and input-rule signatures before configuring them.
   Preserve callback inference and validate option defaults in the owner.
5. Reuse `KEYS` from `packages/utils/src/lib/plate-keys.ts` where the current
   API requires a shared key. Do not copy key contracts into example glue.
6. Keep renderer behavior in the React adapter or copied UI. `plate-ui` owns
   component composition, hooks, providers, subscriptions and kit wiring.
7. For package boundaries, inspect `package.json` exports, peers, dependencies
   and consumers. Prove headless imports without React and React imports with
   their actual peers. Use the existing package generator when appropriate.
8. Prove runtime behavior through the narrow package test. Builder/inference
   changes also run core type tests and declaration build. Serializer changes
   prove round trips, preservation and explicit losses.

For a feature spanning package, React adapter, registry, docs and release,
put each applicable owner and proof in one plan. Record N/A for a layer with
no job. Complete package tests, kit dependencies, browser interaction, docs
examples, English/Chinese teaching and `changeset` before closing that feature.
