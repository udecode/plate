# Perf Evidence: yjs-pr20 Collaboration

Date: 2026-06-02
Target cwd: `/Users/felixfeng/Desktop/repos/plate-copy/.tmp/slate-v2`

## Summary

| Item | Status | Evidence | Route |
| --- | --- | --- | --- |
| Real `@slate/yjs` perf benchmark | baseline | Added `scripts/benchmarks/core/current/yjs-collaboration.mjs`; it prints `METRIC` lines and writes `tmp/slate-yjs-collaboration-benchmark.json`. | `slate-ar-perf` |
| Multi-editor sync | pass | 4 peers, 100 blocks, 40 local text ops, p95 `16.56ms`; all peers converged. | none |
| Awareness updates | pass | 4 peers, 100 awareness selection updates, p95 `10.57ms`; every peer saw `peerCount - 1` remote cursors. | none |
| Reconnect sync | pass | Offline peer plus concurrent online edits, p95 `18.98ms`; all peers converged after reconnect. | none |
| Large-doc sync | pass | 4 peers, 1000 blocks, 120 local text ops, p95 `122.33ms`; all peers converged. | none |
| Focused package correctness | pass | `bun test ./packages/slate-yjs/test`: 106 pass, 0 fail across 16 files. | none |
| `@slate/yjs` typecheck | pass | `bun --filter @slate/yjs typecheck`: exited 0. | none |
| Fast repo gate | pass | `bun check`: lint, package/site/root typecheck, Bun tests, Slate React Vitest passed. | none |
| Focused Yjs browser correctness | checks_failed | Stable failure reproduced through Playwright webServer: `preserves remote appends when an offline replace is undone before reconnect`; peer B stayed `Hello world!`, expected `Lin canonical snapshot.` | `slate-patch` |

## Benchmark Command

```bash
bun ./scripts/benchmarks/core/current/yjs-collaboration.mjs
```

## Metrics

```text
METRIC yjs_multi_editor_sync_p95_ms=16.56
METRIC yjs_awareness_updates_p95_ms=10.57
METRIC yjs_reconnect_p95_ms=18.98
METRIC yjs_large_doc_sync_p95_ms=122.33
METRIC yjs_collaboration_worst_p95_ms=122.33
METRIC yjs_correctness_failures=0
```

Primary metric: `yjs_collaboration_worst_p95_ms=122.33`.

Baseline, latest, and best are the same because this packet only added the real measurement surface. No optimization was kept.

## Correctness Gates

```bash
bun test ./packages/slate-yjs/test
bun --filter @slate/yjs typecheck
bun check
PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/yjs-collaboration.test.ts --project=chromium -g "preserves remote appends when an offline replace is undone before reconnect"
```

The Playwright failure matches `gate-evidence.md` and blocks promotion of perf changes. Route it to `slate-patch` before running optimization packets.
