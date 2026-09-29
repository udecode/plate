# Preserved streaming review evidence

These are selected byte-identical copies from the local, ignored
`docs/plans/artifacts/2026-09-28-conversion-boundary/streaming/` experiment.
`preservation.json` records the source and each copied file's SHA-256.
Reports retain their original commands and historical write-scope statements.
They describe one bounded delegated investigation, not a reviewer panel.

Read `REPORT.md` and `BROWSER-REPORT.md` for outcomes and limits. The prototype
does not establish general incremental Markdown, aggregate quota enforcement,
complete unchanged-node identity, or a 10/50 KB Chromium performance win.
The initial 50 KB sampling target was not met; its receipt is preserved.

Rerun from the repository root with Bun and installed workspace dependencies:

```sh
bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-09-28-conversion-boundary/streaming/probe.ts --correctness-only
bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-09-28-conversion-boundary/streaming/dependency-probe.ts
bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-09-28-conversion-boundary/streaming/identity-probe.ts
```

Inspect `probe.ts` for benchmark modes. `probe-initial.ts` is the exact initial
measured harness; `probe-measured-rich.ts` is the rich-fallback measured harness.
Reruns write beside the executing script. Copy this directory to another path
at the same repository depth before rerunning if the historical receipts must
remain untouched. The scripts generate their fixtures from repository code;
no external corpus is needed.

The browser spec uses the existing fixed Columns scenario, not the candidate
parser. Prepare an owned source-first www development server on port 3297 using
the commands in `browser-identity.json`, then run:

```sh
PLAYWRIGHT_BASE_URL=http://localhost:3297 pnpm --filter www test:www-browser:chromium --config "$PWD/docs/research/probes/2026-09-28-conversion-boundary/streaming/browser.config.ts"
```

`browser-summary.json` preserves compact profiler aggregates, source identity,
outcomes and the missing instrumentation. Nested inclusive durations cannot be
summed into pipeline cost. The original server was stopped. Raw per-event
profiles, screenshots, generated fixtures, server logs and repeated full source
snapshots remain in the original ignored directory; those raw files are not
required to rerun the probes. Browser attempt logs are preserved here.
