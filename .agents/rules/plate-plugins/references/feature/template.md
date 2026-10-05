# {{TITLE}}

Status: planned

Copy this template to `docs/plans/<date>-<slug>.md` and fill every `{{…}}` and TODO.

Optional packs:

- TODO: Add only the packs required by the Feature Manifest.

Flow mode:

- TODO: new public feature entrypoint | existing package plus React/registry | headless package | registry-only

Completion threshold:

- Every applicable Feature Manifest row is complete with evidence.
- Every excluded row has an explicit N/A reason.
- Selected packs, the feature checker and `plan-open` are closed.

Constraints:

- Use one Feature Manifest through every phase.
- Load worker skills only when their phase is active.
- Do not add package-generation tooling.
- Do not copy worker doctrine into this plan.

Feature Manifest:
| Surface | Applies | Owner | Artifacts | Consumer | Proof | Status |
| --- | --- | --- | --- | --- | --- | --- |
| API | pending | pending | pending | pending | pending | pending |
| Package | pending | pending | pending | pending | pending | pending |
| React adapter | pending | pending | pending | pending | pending | pending |
| Registry UI | pending | pending | pending | pending | pending | pending |
| Composition | pending | pending | pending | pending | pending | pending |
| Scale proof | pending | benchmark | pending | users/maintainers | pending | pending |
| Registry metadata/examples | pending | pending | pending | pending | pending | pending |
| Docs | pending | pending | pending | pending | pending | pending |
| Release artifacts | pending | pending | pending | pending | pending | pending |

Package boundary contract:
| Contract | Decision | Evidence |
| --- | --- | --- |
| shared Plate host | pending or N/A with reason | pending or N/A with reason |
| Plite ownership | pending or N/A with reason | pending or N/A with reason |
| external dependency ownership | pending or N/A with reason | pending or N/A with reason |
| entrypoint runtime | pending or N/A with reason | pending or N/A with reason |
| Oxlint coverage | pending or N/A with reason | pending or N/A with reason |

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Feature Manifest complete before source writes | pending | pending |
| Flow mode selected | pending | pending |
| Public API decision owner selected | pending | pending |
| Runtime scale applicability resolved | pending | Mark Scale proof yes and select `performance-observability` when runtime layers or repeated/hot work can change; otherwise record live-source N/A |
| Pre-acceptance Benchmark receipt selected | pending | Name current baseline, target path or disposable prototype, frozen cohorts/budget, deterministic counters, timing/noise, source identities, and correctness guard, or N/A |
| Public feature entrypoint decision recorded | pending | pending |
| Conditional packs selected | pending | pending |

Work Checklist:

- [ ] Fill every Feature Manifest row before source writes.
- [ ] Settle public shape and layer ownership.
- [ ] Resolve Scale proof before source writes. A yes row links a passing
      executable current-owner versus target receipt; a complexity table,
      review score, or future benchmark plan does not satisfy it.
- [ ] Resolve the package host, Plite ownership, external dependency ownership,
      entrypoint runtime, and Oxlint coverage rows for every applicable
      package change.
- [ ] Implement and prove package semantics.
- [ ] Add only applicable package React adapters.
- [ ] Add applicable copied registry component families.
- [ ] Wire applicable kits, static bindings, metadata, dependencies, and examples.
- [ ] Write current-state docs and classify release artifacts.
- [ ] Run selected package, app, registry, docs, browser, and stale-surface proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Manifest coverage | yes | Run `node tooling/scripts/check-plate-feature.mjs {{PLAN_PATH}}` | pending |
| Selected pack closure | yes | Close every selected pack | pending |
| Package proof | pending | Run owner-selected package proof | pending |
| Package boundary proof | pending | Run `pnpm test:manifests`, scoped lint, and the affected Oxlint override audit, or record N/A | pending |
| Scale proof | pending | For a yes row, close `performance-observability` with the pre-acceptance receipt and exact final production-path cohort/budget rerun plus correctness guard; otherwise source-backed N/A | pending |
| Registry/browser proof | pending | Verify runnable copied UI or record N/A | pending |
| Docs/release proof | pending | Verify docs and release classification | pending |

## Brief

### What did you find?

TODO: The finding behind this plan, in at most 40 words.

### What will change?

TODO: What the owner will notice, in at most 40 words.

### What do you need from me?

TODO: The decision the owner must make, or nothing.

### What happens if I say go?

TODO: What go starts and what it does not authorize.

### What could go wrong?

TODO: The largest risk and what limits it.
