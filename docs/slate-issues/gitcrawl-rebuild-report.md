---
date: 2026-05-04
topic: slate-issues-gitcrawl-rebuild-report
status: active
source: .tmp/gitcrawl/2026-05-04T145301Z-refresh.json
---

# Slate Issues Gitcrawl Rebuild Report

## Verdict

The live `gitcrawl` mirror is the current Slate issue corpus for the v2 fork.
Non-live ledgers are not part of this evidence layer.

Use this rebuild as the current triage entrypoint:

- live open issue rows: [gitcrawl-live-open-ledger.md](gitcrawl-live-open-ledger.md)
- live cluster candidates and gap notes: [gitcrawl-clusters.md](gitcrawl-clusters.md)
- human architecture overlay:
  [gitcrawl-recluster-map.md](gitcrawl-recluster-map.md)

## Mirror Evidence

| Metric                                    | Value |
| ----------------------------------------- | ----: |
| Live open issues                          |   630 |
| Live open PRs included in gitcrawl mirror |    29 |
| Live open threads total                   |   659 |
| Hydrated comments/reviews                 |  1856 |
| Embedded rows selected this run           |     0 |
| Gitcrawl clusters                         |   617 |
| Multi-member gitcrawl clusters            |    28 |
| Multi-member thread coverage              |    70 |
| Singleton clusters                        |   589 |
| Largest cluster size                      |     7 |

## Command Evidence

Raw Batch 0 artifacts:

- `.tmp/gitcrawl/2026-05-04T145301Z-doctor.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-refresh.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-doctor-after-refresh.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-cluster.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-clusters.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-threads.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-<id>-detail.json` for each
  multi-member cluster

Commands:

```bash
gitcrawl doctor --json
GITHUB_TOKEN="$(gh auth token)" gitcrawl refresh ianstormtaylor/slate --include-comments --state open --json
gitcrawl cluster ianstormtaylor/slate --threshold 0.80 --min-size 1 --max-cluster-size 40 --k 16 --cross-kind-threshold 0.93 --json
gitcrawl clusters ianstormtaylor/slate --json
gitcrawl threads ianstormtaylor/slate --json
```

## Corpus Notes

1. The live corpus currently has `659` open threads: `630` issues and `29` PRs.
2. Gitcrawl clustering remains conservative: `589 / 617` clusters are
   singletons.
3. Multi-member clusters cover `70 / 659` open threads. They are high-signal
   discovery seeds, not the whole taxonomy.
4. PRs and issues cluster together. That is useful for finding linked fix
   attempts, but PR-only clusters must not count as issue families.
5. Cluster titles are generated slugs. Human names and decisions live in
   [gitcrawl-clusters.md](gitcrawl-clusters.md) and
   [gitcrawl-recluster-map.md](gitcrawl-recluster-map.md).
6. Closed duplicate chains are not part of this open-corpus pass. Fetch closed
   threads only when a specific duplicate/closure claim depends on them.

## Rebuild Decision

- Treat [gitcrawl-live-open-ledger.md](gitcrawl-live-open-ledger.md) as the
  current live issue list.
- Treat [gitcrawl-clusters.md](gitcrawl-clusters.md) as machine-cluster
  discovery plus first human decisions.
- Treat [gitcrawl-recluster-map.md](gitcrawl-recluster-map.md) as the human
  architecture overlay that later ClawSweeper batches should extend.
- Reconcile exact v2 fix claims only through
  [../slate-v2/ledgers/issue-coverage-matrix.md](../slate-v2/ledgers/issue-coverage-matrix.md).
