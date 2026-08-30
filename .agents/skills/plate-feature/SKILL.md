---
description: Deliver a Plate feature end to end across platejs entrypoints, React adapters, copied registry UI, docs, release artifacts, proof, and Plate Next attestation.
argument-hint: <feature | platejs subpath | registry item>
name: plate-feature
metadata:
  skiller:
    source: .agents/rules/plate-feature.mdc
---

# Plate Feature

Handle $ARGUMENTS.

Own one cross-layer feature manifest from intake through handoff. This skill
coordinates existing owners; it does not copy their API, plugin, UI, docs, or
release doctrine.

## Use When

- creating a new Plate feature that must reach registry consumers;
- adding headless, React, registry, docs, or release surfaces to a `platejs`
  entrypoint;
- delivering a headless entrypoint with explicit UI exclusions;
- delivering a registry-only feature with explicit distribution exclusions;
- the user asks for the complete entrypoint-to-registry development flow.

For one settled plugin/entrypoint implementation, use `plate-plugin-creator`. For one
React or registry surface, use `plate-ui`. For public call-shape design, use
`best-api`. For migration/adoption audit, use `plate-next`.

## Distinct Job

`plate-feature` owns:

- the one Feature Manifest shared by every phase;
- phase ordering and legal skips;
- conditional worker and goal-pack routing;
- the cross-layer completion contract;
- final Plate Next attestation and review handoff.

Every worker owns its own law:

| Concern                                                          | Owner                  |
| ---------------------------------------------------------------- | ---------------------- |
| reusable public call shape                                       | `best-api`             |
| cross-layer or breaking adoption plan                            | `plate-plan`           |
| entrypoint semantics, plugin mechanics, colocation, package proof | `plate-plugin-creator` |
| React adapters, copied UI, kits, metadata, browser proof          | `plate-ui`             |
| current-state public teaching                                    | `docs-creator`         |
| package release notes                                            | `changeset`            |
| registry release notes                                           | `registry-changelog`   |
| final adoption/version audit                                     | `plate-next`           |
| closure review                                                   | `autoreview`           |

## Goal

For non-trivial work, create one plan from the specialized template and add
only the packs the manifest requires:

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template plate-feature \
  --with package-api \
  --with docs \
  --with browser \
  --with registry-changelog \
  --with plate-next-attestation \
  --title "<feature>"
```

Omit packs for rows marked `no`. Add `agent-native` only when the workflow,
skill, command, template, or generated agent surface changes.

Read [manifest.md](./rules/manifest.md) before starting. Read
[phases.md](./rules/phases.md) as each phase becomes active. Read
[proof-routing.md](./rules/proof-routing.md) before verification. Do not load
every worker skill up front.

## Entrypoint Creation

There is no feature-package generator. Do not add one. For a new public
entrypoint:

1. inspect the nearest current `platejs` entrypoint family;
2. add each owner to the canonical entrypoint DAG with an explicit `headless`,
   `ssr`, or `client` runtime;
3. author semantic source through `plate-plugin-creator`;
4. regenerate Turbo and runtime-proof state, then run entrypoint, package,
   packed-artifact, SSR, and browser proof as required.

Existing entrypoints are evidence, not doctrine. Reject compatibility aliases,
redundant helpers, and topology that conflicts with current skills.

## Package Host Law

Treat `platejs` as the shared Plate host, not another feature dependency.

- Only `packages/platejs` declares `plitejs`. Its local
  `dependencies.plitejs` stays `workspace:*` so a prerelease publishes one
  exact runtime version. No app or other workspace package imports `plitejs`.
- `packages/platejs` does not depend on another Plate workspace package.
  Absorbed foundation code lives inside the host instead of retaining a
  workspace dependency.
- Plate app code imports public contracts from `platejs`, `platejs/react`, or
  the canonical `platejs/<feature>` entrypoint. Raw Plite package tests
  and the dedicated Plite proof/example surfaces are the only direct Plite
  exceptions.
- Keep an always-required implementation library in `dependencies`. Use a peer
  only when the consumer must share the runtime instance or the library powers
  an opt-in entrypoint/capability. Mark that peer optional only when `platejs`
  remains usable without that capability, set
  `peerDependenciesMeta.<name>.optional: true`, and add the matching dev
  dependency for local build and proof. Add the peer to the direct owning
  entrypoint's `peerDependencies` in the canonical DAG; the manifest's optional
  peer set and the DAG's peer set must match exactly. Optional peers are not a
  dumping ground for normal dependencies.
- Documentation installs `platejs` or `plitejs`, never a package subpath. A
  feature page lists the optional peer libraries required by the subpaths it
  teaches.
- Packed release proof derives each public JavaScript export's runtime and
  declaration peer closure, rejects unrelated peers from the package's base
  dependency graph, and reports sibling peers that a required vendor brings
  transitively. A hand-picked root or feature sample is not package isolation
  proof.
- Root ownership is explicit: basic nodes, basic styles, code block, indent,
  link, and list live at `platejs` and `platejs/react`. Independent product
  capabilities use feature subpaths. Do not add `platejs/basic`, a root
  `BasicKit`, or duplicate feature exports at root.
- Packed release proof records minified consumer sizes for the root and every
  public feature entrypoint. Review each byte diff before running
  `pnpm plite:entrypoint-sizes:update`.

Run `pnpm test:manifests` after changing package
dependencies. Do not weaken the validator to admit a package that violates the
host law.

## Oxlint Boundary Maintenance

`tooling/entrypoints/entrypoint-dag.mjs` is the canonical private import law for
`platejs`, `plitejs`, and `@platejs/test`. `oxlint.config.ts` applies its rule
to all three source trees and owns the wider package/app restrictions. Do not
recreate the internal entrypoint graph as a hand-written
`no-restricted-imports` matrix.

When a package moves into a `platejs/<feature>` entrypoint:

1. add every public headless and React subpath to the entrypoint graph;
2. translate the old package's direct workspace dependencies into direct
   entrypoint permissions, then remove permissions that current production
   imports do not justify;
3. assign every optional peer import to its direct owning entrypoint;
4. keep headless and React permissions separate;
5. assign every entrypoint to exactly one internal task partition;
6. run `pnpm entrypoint:turbo:generate` instead of editing generated package
   scripts, Turbo files, or entrypoint tsconfigs.

Import permission and task invalidation are different facts. Permissions are
direct-only and never become transitive. The graph rejects internal and
cross-package cycles. Turbo and TypeScript dependencies come from actual
production, test, and contract imports; an allowed but unused edge must not
schedule work. A task partition is performance policy, not a public namespace,
so one partition may own several related entrypoints.

Keep these invariants:

- outside `packages/platejs` and the explicit raw Plite proof/test exceptions,
  `plitejs` imports are forbidden;
- `packages/platejs/src` and `packages/plitejs/src` use private relative
  imports instead of importing their own public package names;
- `packages/plitejs/src` never imports `platejs`;
- headless Plate and Plite roots never import `react`, `react-dom`,
  `react-compiler-runtime`, a package React entrypoint, or a React-owned source
  tree;
- React entrypoints may depend on headless code; headless code never depends on
  React entrypoints.
- Root and feature entrypoints must not duplicate public symbols. Run
  `pnpm entrypoint:turbo:check` to prove canonical symbol owners and consumer
  imports as well as the generated DAG.

Use exact source-root, test, proof, or React-owned exclusions. Never add a
package-wide ignore. Run the entrypoint DAG and generator contracts,
`pnpm entrypoint:turbo:check`, and scoped `lint:fix` before handoff.

## Phase Law

Advance one phase at a time:

1. classify the flow and complete every manifest row;
2. settle public shape and layer ownership;
3. create the package shell manually when needed;
4. implement and prove package semantics;
5. add a thin React adapter when needed;
6. author copied registry component families when needed;
7. wire app-owned kits, static variants, metadata, and examples when needed;
8. write current-state docs and release artifacts;
9. run package, type, registry, browser, and stale-surface proof;
10. reuse the same manifest for Plate Next attestation, P1 review, and handoff.

A row may be skipped only as `no` with a concrete N/A reason. Headless and
registry-only flows are first-class modes, not incomplete full flows.

## Completion

Before handoff:

```bash
node tooling/scripts/check-plate-feature.mjs <plan>
```

Then run the proof selected by the manifest, Plate Next version/status checks
for reviewed packages, and P1 `autoreview`. Never mass-attest packages after a
doctrine bump. A package advances only after its own full current review and
recorded evidence.

Stop only when every applicable manifest row is complete, every excluded row
has an explicit reason, all selected packs are closed, and the goal checker
passes.
