---
description: Clone shadcn implementation patterns with source-by-source parity. Use when the user says "shadcn parity", asks to mirror shadcn, copy shadcn UX/architecture/tests, or wants more than inspiration. Excludes post-release template output and synchronization unless explicitly scoped.
name: shadcn-parity
metadata:
  skiller:
    source: .agents/rules/shadcn-parity.mdc
---

# Shadcn Parity

## Core Contract

When the user asks for shadcn parity, treat `../shadcn` as the source of
truth for the external registry/install protocol.

Do not give them "inspired by shadcn" for that protocol. For Plate-owned
component/editor public APIs, upstream is strong evidence rather than a design
ceiling; use `best-api` when a better local surface is plausible.

The rule is simple:

- upstream schema first
- upstream resolver behavior first
- upstream file/layout patterns first
- upstream namespace semantics first
- Plate divergence only when the repo has a real constraint

Plate does **not** fork shadcn CLI. Do not talk about Plate as if it owns a
custom installer. Plate owns a registry and delivery layer around the upstream
shadcn contract.

If you diverge, say exactly why.

## Ownership

Shadcn owns the contract:

- registry item schema
- namespace semantics for third-party registries like `@acme/button`
- resolver behavior for plain items, namespaced items, URLs, and local files
- local-file add behavior
- `components.json` registry semantics

Plate owns the content and delivery:

- registry source files under `apps/www/src/registry/*`
- registry build logic in `apps/www/scripts/build-registry.mts`
- generated registry output under `apps/www/public/r` and `apps/www/public/rd`
- the `@plate` namespace, provider/style policy, and create configuration under
  `apps/www/src/lib/plate-registry-*.ts` and
  `apps/www/src/lib/plate-create.ts`
- dynamic registry delivery in `apps/www/src/lib/registry-response.ts` and the
  owning routes

Important boundary:

- shadcn owns how registry items are resolved and installed
- Plate owns what its registry contains and how its responses are delivered

Plate's registry build is custom. The goal is still upstream parity at the
item and resolver boundary.

Plate `/create` is a thin selector for Plate editor presets. Shadcn owns the
`create` command, preset encoding, provider names, style names, and registry
directory resolution. Plate must not copy the upstream theme, font, color, v0,
or full project-designer product into that route.

## Registry Rules

Registry items should stay as close as possible to upstream `RegistryItem`
shape.

When building or changing Plate registry items:

- keep list parity work on the standard list registry graph; do not create an
  alternative persisted list model or copied UI family
- check `../shadcn` first
- copy upstream file/layout/helper patterns when they fit
- prefer upstream naming and dependency structure over Plate-specific novelty
- keep dynamic Plate-specific behavior in build or response tooling, not in a
  fake registry data model
- treat Base as Plate's default provider and keep one complete semantic item
  surface for Base and Radix; unsupported providers fail closed as providers,
  never as filtered items inside a supported provider
- treat Nova as Plate's default style and support the pinned upstream Nova,
  Vega, Maia, Lyra, Mira, Luma, Sera, and Rhea transforms only when each style
  produces installable output for the complete public semantic registry

Registry dependency rules:

- prefer bare names like `button`, `command`, and `popover` when an upstream
  shadcn registry item exists
- prefer upstream namespace syntax over raw URLs for non-default registries when
  the namespace already covers the case
- prefer explicit `@plate/*` for Plate self-dependencies in registry source
- public generated registry item JSON must rewrite Plate self-dependencies to
  same-base item URLs such as `https://platejs.org/r/*.json`, so direct URL
  installs resolve transitive Plate items from the same registry base
- keep legacy localhost and absolute Plate item URLs as accepted input
  compatibility
- treat `@shadcn/*` as compatibility input only; do not write it in Plate
  registry source or generated output
- if upstream does not expose a small standalone item, use a small Plate
  registry item instead of dragging in a huge upstream dependency just to steal
  one internal file
- do not expand compatibility hacks into new conventions

Do not fork shadcn CLI to compensate for Plate registry problems. Fix the
registry data or Plate build/delivery code instead.

Do not add a Plate `/init` proxy. Prove direct Base/Nova and Radix/Luma
`shadcn create` installs against freshly built local Plate artifacts before
changing the public create flow. Treat npm and the deployed registry directory
as post-release smoke surfaces, not implementation gates.

## Scope Boundary

Post-release template output is not a `$shadcn-parity` audit surface.

- Do not inspect, modify, or gate parity on `templates/**`, template
  `components.json`, `tooling/scripts/update-template*.sh`, or local template
  mirror preparation.
- Do not classify stale template output as a current registry or install
  protocol defect. `.github/workflows/release.yml` owns template
  synchronization after publish.
- Include template generation only when the user explicitly asks for that
  separate release/sync scope. Keep its findings separate from registry
  protocol parity.

This exclusion does not remove upstream `components.json`, URL, or local-file
resolver semantics from protocol parity. Audit the protocol owners, not
post-release consumers of them.

## Current Divergences

These are real Plate divergences today. Treat them as constraints, not as a
pattern to spread.

- Plate publishes a registry from `apps/www`, not from upstream shadcn
  infrastructure
- old generated registry output may still contain absolute Plate self-URLs;
  treat that as compatibility input only, not the source contract

## Red Flags

Stop and reassess if you are about to do any of this:

- describe Plate as a fork of shadcn CLI
- invent a new Plate-only registry schema
- replace upstream namespace behavior with raw URL sprawl
- solve a registry issue by adding more installer logic when the data is wrong
- treat post-release template state as a registry parity failure without an
  explicit template/release scope
