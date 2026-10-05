# {{TITLE}}

This is a project-owned plan template. Copy it to `docs/plans/<date>-<slug>.md` and fill its `{{…}}` placeholders. The pstack block in `AGENTS.md` governs timing, publication and review rows. Relevant domain and executable-validator gates remain required; mark unrequested publication/review N/A.

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

## Benchmark Source

- request: pending
- scope: pending
- invocation: pending
- candidate-identity: pending
- plate-main-identity: pending
- plite-identity: pending
- slate-identity: pending
- named-symptom: pending
- final-artifacts: pending

Boundaries:
- allowed runtime/packages/apps: pending
- allowed benchmark/tests/fixtures: pending
- allowed baseline checkouts/hosts: pending
- non-goals: pending

## Interaction Coverage

- first-interaction: pending
- settled-interaction: pending
- route-scope: pending
- reporter-profile: pending

Use `pass: <proof>` or `N/A: <concrete reason>` for each phase and host.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | pending | pending | pending |
| lockfile / package manager | pending | pending | pending |
| build mode / host / port | pending | pending | pending |
| browser / machine / viewport / DPR | pending | pending | pending |
| route / fixture / document / plugins | pending | pending | pending |
| setup / action / DOM strategy | pending | pending | pending |
| warmups / samples / interleave order | pending | pending | pending |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | pending | pending |
| `benchmark` source and methodology read | yes | pending |
| Existing plan reused | yes | pending |
| Candidate and baseline identities recorded | pending | pending |
| Target/runner discovery completed from current source | pending | pending |
| Host/build/fixture freshness proved | pending | pending |
| Correctness oracle identified | pending | pending |
| All default lanes inventoried | yes | pending |
| `only` narrowing explicitly authorized or N/A | pending | pending |
| Browser/native proof strategy selected | pending | pending |
## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | pending | pending | pending | pending |
| 2 | current-vs-main-product-smoke | pending | pending | pending | pending |
| 3 | plate-vs-plite-decomposition | pending | pending | pending | pending |
| 4 | owner-microbench-and-trace | pending | pending | pending | pending |
| 5 | product-mount-matrix | pending | pending | pending | pending |
| 6 | trusted-editing-matrix | pending | pending | pending | pending |
| 7 | plite-vs-pinned-slate | pending | pending | pending | pending |
| 8 | example-breadth | pending | pending | pending | pending |
| 9 | large-and-stress | pending | pending | pending | pending |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: no cause proven
- lane: N/A: no cause proven
- comparable-baseline: N/A: no cause proven
- material-delta: N/A: no cause proven
- isolated-owner: N/A: no cause proven
- causal-intervention: N/A: no cause proven
- correctness-guard-result: pending
- fix-class: N/A: no cause proven
- long-term-target: N/A: no cause proven
- decision-owner: N/A: no cause proven
- layer-plan: N/A: no cause proven
- compatibility-verdict: N/A: no cause proven
- fix-owner: N/A: no cause proven
- benchmark-command: N/A: no cause proven
- benchmark-rerun: N/A: no cause proven
- benchmark-rerun-result: pending
- correctness-command: N/A: no cause proven
- correctness-rerun: N/A: no cause proven
- correctness-rerun-result: pending
- resume-lane: N/A: no cause proven

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| pending | pending | pending | pending | pending | pending | pending |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| pending | pending | pending | pending | pending | pending | pending |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | pending | Run the exact metrics, comparisons, and correctness proof named above | pending |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs {{PLAN_PATH}}` at cause/resume checkpoints | pending |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | pending |
| Exact post-fix benchmark reruns | pending | Rerun every kept fix against its original lane/baseline | pending |
| Correctness/native behavior reruns | pending | Run named tests and Browser/Chrome/device proof required by the claim | pending |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | pending |
| Benchmark target/metric honesty | yes | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | pending |
| Durable fix decision | pending | For every proven cause, validate the long-term target, Best API/layer-plan route when architectural, hard-cut or hard-law verdict, and concrete implementation owner | pending |
| Package/type/build proof | pending | Run affected package checks/typecheck/build only where owned | pending |
| Browser surface proof | pending | Run Browser for product routes; Chrome/device for native state when applicable, or N/A with reason | pending |
| Changeset/release artifact | pending | Add only for published package behavior/API changes, otherwise N/A | pending |
| Benchmark plan complete validation | yes | Run validator with `--complete` | pending |
| Plan complete | yes | Run `node .agents/pstack/plan-open.mjs {{PLAN_PATH}}` | pending |

Verification evidence:
- Pending.
