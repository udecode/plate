# Feature delivery

Own one cross-layer feature manifest from intake through handoff. This flow
coordinates existing owners; it does not copy their API, plugin, UI, docs, or
release doctrine.

## Use When

- creating a new Plate feature that must reach registry consumers;
- adding headless, React, registry, docs, or release surfaces to a `platejs`
  entrypoint;
- delivering a headless entrypoint with explicit UI exclusions;
- delivering a registry-only feature with explicit distribution exclusions;
- the user asks for the complete entrypoint-to-registry development flow.

For one settled plugin/entrypoint implementation, use `plate-plugins`. For one
React or registry surface, use `plate-ui`. For public call-shape design, use
`best-api`. For migration/adoption audit, use `plate-next`.

## Distinct Job

This flow owns:

- the one Feature Manifest shared by every phase;
- phase ordering and legal skips;
- conditional worker and plan-pack routing;
- the cross-layer completion contract;
- final Plate Next attestation and review handoff.

Every worker owns its own law:

| Concern                                                           | Owner                  |
| ----------------------------------------------------------------- | ---------------------- |
| reusable public call shape                                        | `best-api`             |
| cross-layer or breaking adoption plan                             | `plate-architecture`         |
| entrypoint semantics, plugin mechanics, colocation, package proof | `plate-plugins` |
| React adapters, copied UI, kits, metadata, browser proof          | `plate-ui`             |
| current-state public teaching                                     | Plate Docs         |
| package and registry release notes                                | `changeset`            |
| final adoption/version audit                                      | `plate-next`           |
| pre-acceptance and final runtime scale proof                      | `benchmark`            |
| applicable closure review                                         | the pstack block's Review rule |

## Plan

For non-trivial work, copy [`template.md`](template.md)
to `docs/plans/<date>-<slug>.md` and fill its `{{…}}` placeholders. Append the
[plate-next-attestation pack](plate-next-attestation.md)
when a package is attested, and the performance-observability pack
(`../../../benchmark/templates/performance-observability.md`) when the Feature
Manifest's Scale proof row is `yes`. That row must resolve before source writes when the feature changes a
runtime layer or repeated/hot work.

Read [manifest.md](manifest.md) before starting. Read
[phases.md](phases.md) as each phase becomes active. Read
[proof-routing.md](proof-routing.md) before verification. Do not load
every worker skill up front.

## Phase Law

Advance one phase at a time:

1. classify the flow and complete every manifest row;
2. settle public shape and layer ownership, including `plate-architecture`'s
   registry-only test before calling a flow registry-only;
3. resolve Scale proof before source writes. A positive row runs Benchmark's
   embedded current-owner versus target probe, using a disposable target
   prototype when necessary. Paper complexity, a review score, or deferred
   measurement cannot accept the target;
4. create the package shell manually when needed;
5. implement and prove package semantics;
6. add a thin React adapter when needed;
7. author copied registry component families when needed;
8. wire app-owned kits, static variants, metadata, and examples when needed;
9. write current-state docs and release artifacts;
10. run package, type, registry, browser, stale-surface, and applicable final
    production-path scale proof;
11. resolve Plate Next attestation in the same manifest and the pstack block's
    Review rule, then hand off. Attest only after a full current package review.

A row may be skipped only as `no` with a concrete N/A reason. Headless and
registry-only flows are first-class modes, not incomplete full flows.

## Completion

Before handoff:

```bash
node tooling/scripts/check-plate-feature.mjs <plan>
```

Then run the proof selected by the manifest, Plate Next version/status checks
for reviewed packages, and the review the pstack block's Review rule requires. Never mass-attest packages after a
doctrine bump. A package advances only after its own full current review and
recorded evidence.

Stop only when every applicable manifest row is complete, every excluded row
has an explicit reason, and all selected packs are closed.
