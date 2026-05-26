---
date: 2026-05-23
topic: slate-issues-gitcrawl-rebuild-report
status: active
source: .tmp/gitcrawl/2026-05-23T091840Z-refresh.json
---

# Slate Issues Gitcrawl Rebuild Report

## Verdict

The current live `gitcrawl` mirror is the active Slate issue corpus for the v2 fork. The previous live mirror was the `2026-05-04T145301Z` run. This refresh keeps the same evidence layer and updates only live corpus accounting.

Use this rebuild as the current triage entrypoint:

- live open issue rows: [gitcrawl-live-open-ledger.md](gitcrawl-live-open-ledger.md)
- live cluster candidates and gap notes: [gitcrawl-clusters.md](gitcrawl-clusters.md)
- human architecture overlay: [gitcrawl-recluster-map.md](gitcrawl-recluster-map.md)
- manual v2 sync state: [gitcrawl-v2-sync-ledger.md](gitcrawl-v2-sync-ledger.md)

## Mirror Evidence

| Metric | Previous run | Current run |
| --- | ---: | ---: |
| Live open issues | 630 | 631 |
| Live open PRs included in gitcrawl mirror | 29 | 33 |
| Live open threads total | 659 | 664 |
| Hydrated comments/reviews | 1856 | 1850 |
| Gitcrawl clusters | 617 | 620 |
| Multi-member gitcrawl clusters | 28 | 28 |
| Multi-member thread coverage | 70 | 72 |
| Singleton clusters | 589 | 592 |
| Largest cluster size | 7 | 7 |

## Command Evidence

Raw artifacts:

- `.tmp/gitcrawl/2026-05-23T091840Z-doctor-before-refresh.json`
- `.tmp/gitcrawl/2026-05-23T091840Z-refresh.json`
- `.tmp/gitcrawl/2026-05-23T091840Z-refresh.log`
- `.tmp/gitcrawl/2026-05-23T091840Z-doctor-after-refresh.json`
- `.tmp/gitcrawl/2026-05-23T091840Z-cluster.json`
- `.tmp/gitcrawl/2026-05-23T091840Z-clusters.json`
- `.tmp/gitcrawl/2026-05-23T091840Z-threads.json`
- `.tmp/gitcrawl/2026-05-23T091840Z-cluster-<id>-detail.json` for each multi-member cluster

Commands:

```bash
gitcrawl doctor --json
GITHUB_TOKEN="$(gh auth token)" gitcrawl refresh ianstormtaylor/slate --include-comments --state open --json
gitcrawl cluster ianstormtaylor/slate --threshold 0.80 --min-size 1 --max-cluster-size 40 --k 16 --cross-kind-threshold 0.93 --json
gitcrawl clusters ianstormtaylor/slate --json
gitcrawl threads ianstormtaylor/slate --json
gitcrawl cluster-detail ianstormtaylor/slate --id <multi-member-id> --member-limit 40 --body-chars 280 --json
```

## Delta From Previous Live Run

| Delta | Count | Decision |
| --- | ---: | --- |
| Previous live issue rows | 630 | Historical live run. |
| Current live issue rows | 631 | Current issue corpus. |
| New live issues absent from previous live ledger | 1 | Add to live triage. |
| Previous live rows no longer live-open | 0 | Remove from live ledger if any. |
| Frozen 2026-04-02 ledger rows | 682 | Historical corpus only. |

### New Live Issues Missing From Previous Live Ledger

| Issue | Title | Labels | Updated | Action |
| --- | --- | --- | --- | --- |
| [#6061](https://github.com/ianstormtaylor/slate/issues/6061) | Unable to find the path for Slate node in v0.124.1 | bug | 2026-05-20 | add to v2 sync ledger as `not-started` / `needs-repro` until reviewed |

### Previous Live Rows No Longer Open

| Issue | Action |
| --- | --- |
| none | none |

## Corpus Notes

1. The live corpus currently has `664` open threads: `631` issues and `33` PRs.
2. Gitcrawl clustering remains conservative: `592 / 620` clusters are singletons.
3. Multi-member clusters cover `72 / 664` open threads. They are high-signal discovery seeds, not the whole taxonomy.
4. PRs and issues cluster together. That is useful for finding linked fix attempts, but PR-only clusters must not count as issue families.
5. Closed duplicate chains are not part of this open-corpus pass. Fetch closed threads only when a specific duplicate/closure claim depends on them.

## Rebuild Decision

- Treat [gitcrawl-live-open-ledger.md](gitcrawl-live-open-ledger.md) as the current live issue list.
- Treat [gitcrawl-clusters.md](gitcrawl-clusters.md) as machine-cluster discovery plus first human decisions.
- Treat [gitcrawl-recluster-map.md](gitcrawl-recluster-map.md) as the human architecture overlay that later ClawSweeper batches should extend.
- Reconcile exact v2 fix claims only through [issue-coverage-matrix.md](../slate-v2/ledgers/issue-coverage-matrix.md).
