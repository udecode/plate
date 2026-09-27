# Research verification

Date: 2026-09-24. Scope: research and review records only.

| Check | Observed result |
| --- | --- |
| Both external JSON shards | Parsed; source-reference IDs, ranges, commit identity and fingerprints checked by their assigned researchers. Parent consumed facts, alternatives and limitations. No upstream tests executed. |
| Parent source verification | 98 external-shard read rows and 25 current local source rows match recorded SHA256. Two prior decision rows retain fingerprints from before summary reconciliation. |
| TSV structure | All six tables have consistent column counts; 165 data rows total. |
| Semantic source references | 125 unique read IDs; every lead source reference resolves. |
| Review recording | `node tooling/scripts/review-ledger.mjs record docs/plite/research/2026-09-24-export-architecture/review-draft.json` succeeded after matching reconciliation questions to the exact prior records. |
| Generated ledger | `node tooling/scripts/review-ledger.mjs render` succeeded. |
| Scoped whitespace | `git diff --check` on this run, plan, decision, index and immutable review passed. |
| Global ledger | `node tooling/scripts/review-ledger.mjs check` failed on unrelated stale inventory `platejs/list`: observed `589737e816df5ad1155150705489124c1b292f0ca1bf1c5b462fb626ea96edde`, indexed `4793257422361cfa9af503d5c54fa3e2cca4dddfaa6f62b99df3c12fdb17992b`. No list source or review was changed to conceal the gap. |

These checks establish recorded source identity and research consistency only.
They do not establish new product behavior, browser/native-viewer parity,
offline HTML packaging or export performance. The earlier adopted capture
receipts remain attached to their original review and source. The new direction
is proposed for Task design; research completion is not runtime adoption.
