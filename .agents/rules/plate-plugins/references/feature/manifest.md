# Feature Manifest

The plan owns one table with these exact rows:

| Surface                    | Applies | Owner | Artifacts                           | Consumer    | Proof                       | Status                       |
| -------------------------- | ------- | ----- | ----------------------------------- | ----------- | --------------------------- | ---------------------------- |
| API                        | yes/no  | owner | paths or N/A reason                 | consumer    | command/audit or N/A reason | pending/complete/N/A: reason |
| Package                    | yes/no  | owner | paths or N/A reason                 | consumer    | command/audit or N/A reason | pending/complete/N/A: reason |
| React adapter              | yes/no  | owner | paths or N/A reason                 | consumer    | command/audit or N/A reason | pending/complete/N/A: reason |
| Registry UI                | yes/no  | owner | paths or N/A reason                 | consumer    | command/audit or N/A reason | pending/complete/N/A: reason |
| Composition                | yes/no  | owner | paths or N/A reason                 | consumer    | command/audit or N/A reason | pending/complete/N/A: reason |
| Scale proof                | yes/no  | benchmark | baseline/target/final artifacts or N/A reason | users/maintainers | pre-acceptance and final production rerun or N/A reason | pending/complete/N/A: reason |
| Registry metadata/examples | yes/no  | owner | paths or N/A reason                 | consumer    | command/audit or N/A reason | pending/complete/N/A: reason |
| Docs                       | yes/no  | owner | paths or N/A reason                 | consumer    | command/audit or N/A reason | pending/complete/N/A: reason |
| Release artifacts          | yes/no  | owner | paths or N/A reason                 | consumer    | command/audit or N/A reason | pending/complete/N/A: reason |

Rules:

- `Applies` is `yes` or `no`, never `maybe`.
- A `yes` row names a real owner, artifact, consumer, and proof.
- A `no` row carries an explicit `N/A:` reason in Artifacts, Proof, and Status.
- Keep one table through every phase. Do not create separate package, UI, docs,
  or release status ledgers that can disagree with it.
- Status stays `pending` while work remains and becomes `complete` only after
  its proof is recorded.
- `Scale proof` is `yes` when the feature adds, retains, or changes a runtime
  layer, cache, index, projection, store, subscription, scheduler, geometry
  owner, or repeated/hot work. Before source writes, link a passing embedded
  Benchmark receipt with frozen cohorts/budget, current baseline, target path
  or disposable prototype, deterministic cost, timing/noise, source identity,
  and correctness guard. Completion links the exact final production-path
  rerun. A paper budget or future benchmark plan cannot close the row.
- `Scale proof` may be `no` only with live-source evidence that the work is
  type-only or cannot change repeated/hot runtime cost.

When `Package` applies, add one subordinate `Package boundary contract`
section to the same plan with these resolved rows:

| Contract                      | Decision                                                                                                        | Evidence                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| shared Plate host             | public `@platejs/*` consumers declare an explicit `peerDependencies.platejs` range and `devDependencies.platejs: workspace:^`; consumers never put `platejs` in normal dependencies; the `platejs` host does not peer-depend on itself | manifest path plus `pnpm test:manifests` |
| Plite ownership               | only `packages/platejs` declares or imports `plitejs`; raw Plite proof/test exceptions are named                | manifest/import audit                    |
| external dependency ownership | normal dependency, shared-runtime peer, or opt-in optional peer selected per actual consumer job                | manifest plus import/entrypoint audit    |
| entrypoint runtime            | every public entrypoint declares `headless`, `ssr`, or `client`; headless roots stay React-free                 | DAG runtime matrix and generated proofs  |
| Oxlint coverage               | affected `oxlint.config.ts` override updated, or `N/A:` with proof that existing globs cover the new topology   | scoped lint plus config source audit     |

The section records the actual package paths. Do not copy placeholder rows into
the final evidence, and do not use an exception as a substitute for moving code
to its correct owner.

Flow presets are classification aids, not generated schemas:

| Flow                                 | Normally applies                                                                   |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| new public feature entrypoint        | all structural rows; Scale proof is yes unless live source proves zero runtime impact |
| existing package plus React/registry | structural rows                                                                    |
| headless package                     | API, Package, Docs, Release                                                        |
| registry-only                        | Registry UI, Composition, Metadata/examples, Docs, Registry release                |

Choose the mode that matches the structural rows. API, docs, and release rows
may vary in the other flows when their explicit evidence explains why.
Before selecting `registry-only`, apply the registry-only test in
`.agents/playbooks/references/architecture.md` (Pick the layer).
