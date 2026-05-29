---
tags: [editor-benchmarks, evidence-kit, registry, hard-cut]
verdict: accepted
decision: Use a registry-driven Evidence Kit control plane and discard unregistered old benchmark artifacts from active claims.
---

# Evidence Control Plane

## Goal

Make the benchmark workflow self-improving while Slate v2 evolves.

Evidence Kit is the active control plane:

- registered artifact list
- normalized result rows
- health report
- ranked next actions
- generated docs/dashboard

Benchmark runners still live with their owners. Slate v2 owns Slate v2
measurement commands. Evidence Kit owns whether the output counts as current
evidence.

## Implemented

- Added `research/benchmark-registry.json`.
- Moved active artifact ownership out of hardcoded source constants.
- Added `benchmarks/benchmark-health.mjs`.
- Added `benchmarks/results/benchmark-health-latest.json` generation.
- Added `evidence:health` and `evidence:refresh`.
- Updated `docs/perf/index.html` to show benchmark health and next actions.

## Rule

Old benchmark JSON is discarded unless it is registered.

That does not mean source-owned benchmark runners are deleted. It means random
historical `tmp/*benchmark*.json` no longer counts as active evidence.

## Verification

```sh
npm run evidence:refresh
npm run check
```
