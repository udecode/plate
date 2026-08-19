# Version chains and runners

Scope:
Seven repositories across runtime state rehydration, transactional version
upgrades, content migration CLIs, and editor JSON serialization.

Sources sampled:
- Dexie `Version.upgrade` and `runUpgraders`.
- Redux Persist `createMigrate`.
- Zustand persist middleware.
- Sanity Migrate definition, traversal, dry-run, and write runner.
- Lexical serialization/versioning doctrine and implementation.
- ProseMirror current-schema JSON parsing.
- Tiptap's feature-local math migration utility.

Top leads:
1. Dexie target-version steps and deterministic oldest-to-newest execution.
2. Zustand source-version envelope and successful-migration writeback.
3. Sanity shared definition for dry-run and bounded offline execution.

Rejected leads:
- Lexical per-node `version`: officially non-composable and permanent runtime
  baggage.
- ProseMirror current-schema parser: validator, not migration owner.
- Tiptap feature utility: repeats Plate's fragmented current state.
- Zustand single callback: useful envelope, insufficient chain ownership.

Duplicate leads:
- Redux Persist independently confirms target-version key selection but is a
  weaker implementation than Dexie.

Score changes:
- Dexie promoted to 10.
- Sanity Migrate promoted to 9.
- Redux Persist retained as supporting evidence at 8.
- Zustand retained for envelope/writeback at 7.

Next query:
None. The remaining architecture question is Plate API design, not more OSS
discovery.

