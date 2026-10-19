---
review_scopes:
  - uploads
review_basis:
  - 2026-09-19-uploads-official-files-sdk
work_kind: implementation
---

# Upload API hard cut

Status: Complete

## Outcome

Plate names the editor-owned upload lifecycle after its job while retaining
Files SDK names only at the provider integration boundary.

## Scope

- Rename `platejs/files` to `platejs/upload` with no compatibility entrypoint.
- Rename `BaseFilesPlugin`, `FilesPlugin`, their public `Files*` contracts,
  `PLUGINS.files`, and the `mediaUpload` draft schema to upload terminology.
- Rename the copied `FilesKit`, upload renderer, static omission kit, registry
  items, docs route, examples, tests, generated schema, and package proof.
- Keep the completed `FilePlugin` node and Files SDK's own client, gateway,
  route, transport result, and provider vocabulary.
- Repair current doctrine, Vision, decisions, and review inventory. Preserve
  immutable historical review records and proof artifacts as history.

## Acceptance

- `FilePlugin` remains the completed generic file node under `platejs/media`.
- `UploadPlugin` from `platejs/upload/react` owns admission, draft slots,
  progress, cancellation, and completion into installed media descriptors.
- Public source, exports, docs, copied registry source, tests, and current
  generated outputs contain no old Plate-owned files/media-upload names.
- There are no aliases for the deleted package, plugin, key, schema type, kit,
  or renderer.
- Focused headless, React, registry, docs, package-entrypoint, and ledger checks
  pass, with any unrelated pre-existing blocker reported exactly.

## Next action

None. The surviving API, generated outputs, doctrine and review inventory are
reconciled.

## Evidence

- `UploadPlugin` and `BaseUploadPlugin` own the lifecycle through
  `platejs/upload` and `platejs/upload/react`; `FilePlugin` remains the completed
  file node under `platejs/media`.
- Package typechecks, 28 package tests, 8 copied UI tests, partition lint, the
  package build, editor contract generation, API reference generation, docs
  source validation, registry source validation and the 318-payload registry
  freshness check pass.
- The current-source hard-cut scan finds none of the deleted Plate-owned names
  or entrypoints. Files SDK client, route and storage names remain at the
  provider boundary by design. Templates are unchanged.
- Plate Next doctrine v223 validates, and installed skill mirrors carry the
  same upload/file distinction as their source rules.
- The broad www integration typecheck reaches only the existing
  `HistoryPlugin.ts:23` TS2589 blocker after its stale files-named API contract
  was repaired. The repository-wide schema audit reports unrelated existing
  violations and no upload-owner violation.
- Machine-readable command outcomes and proof limits are recorded in
  `docs/plans/artifacts/upload-api-hard-cut/verification.json`.
