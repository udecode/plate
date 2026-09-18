# Table substrate ownership research

Status: Complete — Pursue focused design; product implementation not authorized by this review.

Question: From first principles, which table selection, resizing, topology, transfer and view responsibilities belong in Plite, Plate or copied UI? Does source evidence from other editors justify redesign after the September 17 adoption?

Scope: Current table owners and real consumers; generic Plite selection and mounted-view hooks; ProseMirror/Tiptap, Lexical, CKEditor, ProseKit and Milkdown prior art. Search additional projects only when they supply an independent ownership model.

Acceptance: Reconcile prior table reviews; read exact upstream source/tests at recorded revisions; compare keep/change/add/delete/move/replace lanes; record deduplicated findings and one Stop/Pursue/Defer verdict with proposed call shape, owner, proof limits and next owner. Product code, implementation plans, publication, issue corpus completion and performance/native-parity certification are excluded.

Stop rule: Stop when the material selection and resize ownership alternatives have source-backed benefits/costs and each candidate promotion has a current consumer or explicit rejection. Do not collect decorative links after the verdict is supported.

Evidence gap assessed: The completed table plan verified the implemented contract but did not settle whether Plite has sufficient custom selection and generic mounted interaction primitives. Earlier Stop was a baseline to challenge. A fresh actual-hook probe reproduces a same-key host replacement paint failure; that narrows current table proof to partial without undoing prior adoption.

Expected promotion owner: Task design/plan if contracts, lifetime, adoption and proof remain coupled; no downstream execution in this research request.

Checkpoints:
- [x] Reconcile history and current owners/consumers.
- [x] Inspect independent OSS selection/resize models and tests.
- [x] Deduplicate, rank and reject/promote concrete leads.
- [x] Persist source-grounded review and reconcile ledger state.

The [full assessment](REPORT.md) recommends headless table selection commands in
Plate, consolidated mounted table interaction, and a measured paint-lifetime
repair. It rejects blanket promotion of table semantics into Plite. The
[current decision](../../../research/decisions/table-ownership.md) and
[immutable review](../../../research/review-records/2026-09-17-table-substrate-ownership.json)
reconcile the earlier closure.

Research state: 7 repositories across 6 editor projects and 3 independent table
engines; 206 read/observation rows, including metadata and repeated revisions;
15 recorded web/issue queries; 8 deduplicated leads; 4 promoted research packets;
7 explicit rejection/reopening entries. Counts are TSV row counts, not unique
source files, executed tests, or independent architecture votes. The four
packets feed one Task design/plan, not four new tasks.

Source and freshness details are in [the registry](repo-registry.tsv),
[the read log](read-log.tsv), [upstream input hashes](sources/upstream-inputs.json),
and the bounded [PM/Tiptap](shards/pm.json), [Lexical](shards/lexical.json),
[CKEditor](shards/ckeditor.json), and [local/adapters](shards/local-and-adapters.json)
shards. Three independent source investigations and one local diagnostic were
consumed and closed. Current upstream supplements supersede stale snapshot
observations where explicitly marked; no checkout or branch was changed.

The [diagnostic](shards/local-paint.json) has 11 passing controls followed by the
failing replacement-paint assertion. Its failing research probe is intentional
evidence, not a green regression test. The existing hook spec passed unchanged.
No upstream suite, full browser run, physical-device run, or candidate benchmark
was executed. Product source, product tests, workflow rules, and the completed
implementation plan are unchanged.

Next owner: `$task design plan table: promote semantic selection and consolidate mounted table interactions`.
The target needs call-shape, selection-intent, host-lifetime, keyboard/RTL,
adoption, and scale decisions together. No downstream implementation plan was
created by this research request.
