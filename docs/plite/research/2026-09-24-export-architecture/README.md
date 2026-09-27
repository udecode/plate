# Export architecture research

Question: If complete document export were part of the original requirements,
what would Plite, Plate, format packages and copied UI each own?

Scope: all current document-export responsibilities and the explicit PDF,
print and image alternatives. Compare editor equivalents at verified local
source revisions and official documentation.

Stop rule: stop after the materially different editor families explain each
candidate ownership lane and every local unit has a verdict or named evidence
gap. This is a sampled export comparison, not an exhaustive editor audit.

Current local gap: the completed export capture repair proves correctness of
its chosen paths but does not establish that full export architecture is best.

Expected promotion owner: Task design/planning if public APIs, layer ownership,
adoption and proof remain coupled; no implementation is authorized by research.

Exclusions: import internals beyond shared contracts; unrelated editing
features; new runtime benchmarks; claims about commercial internals unavailable
for inspection; copying upstream code.

Acceptance and lifecycle: [research plan](../../../plans/2026-09-24-exports-first-principles-research.md).

Verdict: **Pursue document-first conversion through existing schema and format
owners.** Remove temporary editing-runtime construction and copied conversion
coordination. Preserve styled presentation, clipboard transfer and format
dependencies as distinct jobs. DOCX backend selection remains provisional;
a new OSS PDF engine is deferred.

Read the [complete direction and 12-unit audit](shards/001-direction.md), then
the [immutable review](../../../research/review-records/2026-09-24-exports-first-principles-architecture.json).
The [current decision](../../../research/decisions/export-fidelity.md) reconciles
this direction with the completed capture repair. Proposed APIs are illustrative.

## Evidence and stopping point

- Seven external repositories searched and deeply read across six editor
  families, plus the local Plate/Plite checkout. Ninety-eight external-shard read
  rows and 27 parent local/history rows; repeated ranges and metadata are reads,
  not distinct files. Exact revisions, whole-file hashes and licenses are in
  the two JSON shards and `sources/local-reads.json`.
- Four Lexical issue search results sampled; two issue bodies read. The bounded
  BlockNote issue query returned zero. No issue reproduction was executed.
- Eight semantic leads kept: five promoted to one Task design packet, two
  retained laws and one deferred PDF decision. Three overlapping upstream
  candidate rows were merged into existing semantic topics. Two historical
  source facts were reused: Lexical EditorState and the Tiptap license.
- Nine rejected alternatives have explicit reopening conditions. The most
  important are a universal ExportPlugin, HTML as a universal lossless model,
  all format engines in Plite, and unmeasured direct-DOCX superiority.
- Expected/reviewed units: 12/12. Seven Pursue, four Stop/retain, one Defer;
  no selected unit skipped. Import internals, full per-node converter fidelity,
  commercial internals and new runtime/native/performance proof are excluded.

The five A-grade design leads are `document-input`, `reuse-semantic-compiler`,
`projection-contract`, `format-owned-customization` and `docx-native-mapping`
under the `exports:` semantic namespace. `lead-ledger.tsv` records exact keys,
support and scores. `promoted-ledger.tsv` names the owner and the next proof.
Research validation uses `node tooling/scripts/review-ledger.mjs check`.
That global check currently stops at an unrelated stale `platejs/list` inventory
fingerprint; it is not green. Scoped source/TSV/reference checks passed; see
[the receipt](sources/verification.md).
Product and benchmark commands must be selected against Task's actual prototype;
this review does not pretend a source check certifies those outcomes.

Next owner: `$task design plan exports: document-first conversion, schema-owned
format codecs, and lifecycle-free rendering`. No next search shard is needed:
remaining questions concern the local design and matched experiments.

Changed surfaces: this research run, its existing research plan, the export
decision, immutable review and generated review ledger. No product code changed.
No user decision or access is blocking the research outcome.

Workflow limits: an official Lexical page returned an internal fetch error;
local source supplied the comparison. Broad history lookup reported a pre-existing
malformed header in the June 12 clipboard research registry; its artifact was
not changed. Initial discovery query wording was not retained and is marked
unknown rather than reconstructed. Source comparisons are fixed local snapshots,
not assertions of upstream freshness. No workflow repair is warranted here.
