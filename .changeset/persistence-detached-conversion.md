---
'@platejs/cli': major
'platejs': major
'plitejs': patch
---

Convert persisted documents explicitly at the storage boundary. Define one immutable target with `defineDocumentMigrations({ plugins, schema, sourceFingerprints, steps })`, then call `migrateDocument(input, { migrations, source? })`. The result contains `{ output, applied, source }`; save or load `output` directly.

Plate editors accept current-schema input only. Remove editor `migrations`, plugin `prepareDocument`, `migrateElementIds`, root migration imports, and public v53 manifest imports. Import migration APIs from `platejs/migrations`. Raw documents require `source: number | 'current'`; persisted envelopes carry their own exact schema identity.

`plate migrate run` uses the same detached converter. Pass `--from <version|current>` for raw files; mixed batches apply the flag only to raw documents.

Persist authored state with codec v6 footprints so current checkpoint admission can validate and index retained revisions without decoding their bodies. Older codec versions convert to v6 during admission.

Compile Authored checkpoint construction and admission as a private capability of the installed Authored plugin. Generic Plite internals and Plate's core facade do not export Authored algorithms.
