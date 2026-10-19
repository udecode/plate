---
review_scopes:
  - uploads
review_basis:
  - 2026-09-20-uploads-static-owner-cut
work_kind: implementation
---

# Upload static owner cut

Status: Complete

## Outcome

The upload schema owner omits unresolved drafts from static rendering without a
copied `upload-static` registry item.

## Scope

- Give `BaseUploadPlugin` the null default renderer beside its null HTML codec.
- Compose `BaseUploadPlugin` directly in the full static editor kit.
- Delete the `upload-static` source, registry item, dependency and public docs.
- Keep the omission regression test with the package owner and prove editable
  `UploadElement` configuration still overrides the default.
- Repair the registry ownership rule that allowed configuration-only static
  items, regenerate affected skills and registry output, and reconcile uploads.

## Acceptance

- Static rendering of an unresolved upload draft emits no node markup.
- `UploadPlugin.configure({ component: UploadElement })` retains the editable
  copied UI.
- `media-static` remains independent of upload.
- No current registry source, generated payload, docs or dependency references
  `upload-static`.
- Package tests and typecheck, registry tests/source/generation, docs parity,
  workflow mirror checks and the review ledger pass.

## Next action

None. Package semantics, copied composition, current docs, workflow doctrine,
generated registry output and uploads history agree.

## Evidence

- `BaseUploadPlugin` owns null static rendering beside its null HTML codec;
  copied `UploadKit` still overrides it with `UploadElement`.
- Upload and upload-react partitions pass 30 tests and 102 assertions, including
  exact omission of path `1` from static markup and editable component override.
- Both upload partitions typecheck. Registry source and 15 tests with 1,344
  assertions pass.
- Registry generation is fresh at 317 canonical payloads with generation
  `07db4e54fce4ad90ec23f3bf13f65b2c8fbdcf38892a5a73c510800dc36e07b8`;
  no `upload-static` payload or aggregate dependency remains.
- Docs, changelog, scoped lint, hard-cut scans and `git diff --check` pass.
- Plate Next doctrine v224 and all 15 workflow tests pass; generated Codex and
  Claude mirrors contain the corrected registry-owner rule. Agent Native
  Reviewer found no route, source, mirror or proof gap.
- Machine-readable command outcomes and limits are recorded in
  `docs/plans/artifacts/upload-static-owner-cut/verification.json`.
