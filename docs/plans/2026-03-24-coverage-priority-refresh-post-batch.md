---
title: Coverage Priority Refresh Post Batch
type: testing
date: 2026-03-24
status: completed
---

# Coverage Priority Refresh Post Batch

## Goal

Rerun fresh repo coverage after the recent coverage batch and regenerate the non-React package and file rankings from current state.

## Constraints

- exclude `/react`
- no coverage vanity
- score only files worth direct unit or editor-contract testing
- sync against the March 17, March 22, March 23, and March 24 maps so already-completed sweeps do not get over-prioritized

## Outputs

- refreshed markdown priority map
- refreshed package TSV
- refreshed file TSV

## Phases

1. Read prior maps and scoring shape
2. Rerun repo coverage and inspect fresh `lcov`
3. Generate refreshed package and file scores
4. Summarize the best next work sorted by value

## Completed Outputs

- [2026-03-24-coverage-priority-map-refresh-post-batch.md](docs/plans/2026-03-24-coverage-priority-map-refresh-post-batch.md)
- [2026-03-24-coverage-priority-packages-refresh-post-batch.tsv](docs/plans/2026-03-24-coverage-priority-packages-refresh-post-batch.tsv)
- [2026-03-24-coverage-priority-files-refresh-post-batch.tsv](docs/plans/2026-03-24-coverage-priority-files-refresh-post-batch.tsv)
