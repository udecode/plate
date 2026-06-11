# ProseMirror Issue Closure Ledger

status: checked
source: `docs/editor-issue-harvester/prosemirror/full/classified-issues.tsv`

Rule: every relevant issue needs an explicit checkmark. A cluster/matrix row
does not close an issue. Close a relevant issue only by linking and verifying
an exact existing Slate-v2 test, writing and verifying a fresh Slate-v2 test,
or recording a concrete defer owner. Under Slate-v2-only scope, Plate rows
are defer-only and must not trigger Plate edits.

## Counts

| Bucket | Count |
| --- | ---: |
| skip | 572 |
| defer | 502 |
| keep-portable | 321 |
| plate-owned | 25 |
| unchecked relevant | 0 |

## Closure Counts

| Closure | Count |
| --- | ---: |
| irrelevant:invalid-skip | 572 |
| relevant:deferred-with-owner | 527 |
| relevant:covered-by-existing-test | 194 |
| relevant:test-written | 127 |

## Next Unchecked Relevant Issues

| Check | Issue | Disposition | Matrix key | Owner | Command | Title |
| --- | ---: | --- | --- | --- | --- | --- |

Full ledger: `issue-closure-ledger.tsv`.
