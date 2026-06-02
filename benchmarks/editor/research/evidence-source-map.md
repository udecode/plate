---
tags: [editor-benchmarks, evidence-kit, source-map]
verdict: accepted
decision: Use Evidence Kit source maps and benchmark rows as the new editor benchmark authority.
---

# Evidence Source Map

The editor benchmark lab is an Evidence Kit package. It records source material,
fuzz contracts, benchmark result rows, package-boundary checks, startup checks,
scope hashes, and perf docs from one place.

Primary source config:

- `research/editor-frameworks-sources.json`

Primary benchmark registry:

- `research/benchmark-registry.json`

Current local target set:

- Slate v2 package and benchmark commands
- Slate package

Accepted transfer:

- Benchmark claims must use `benchmarks/results/*latest.json` rows with visible
  `ok`, `partial`, `unsupported`, `timeout`, `over-budget`, or error statuses.
- Active benchmark claims must come from `research/benchmark-registry.json`.
  Unregistered benchmark JSON files are historical output and are ignored by
  the active Evidence Kit flow.
- Rich-text editor claims should start from
  `benchmarks/results/rich-text-editors-latest.json`. That file imports the
  registered Slate v2 vs Slate artifact families. The active comparison scope is
  Slate v2 and Slate only, with Slate chunk-on as the baseline.
- External or sibling-repo inspiration starts as a fetch manifest under
  `research/repos/<topic>/manifest.json` or copied data under
  `benchmarks/data/<topic>/`.
- Old browser-app benchmark targets are not preserved. Future comparison work
  adds target-owned evidence adapters and benchmark rows after the Slate-only
  scope is explicitly reopened.

Rejected transfer:

- Restoring the deleted Next/Vite apps as the default benchmark owner.
- Keeping framework template zoo files as future-proofing.
- Treating a generated placeholder row as performance evidence.
- Treating an unregistered tmp benchmark artifact as active evidence.
