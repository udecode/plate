---
review_scopes:
  - uploads
review_basis:
  - 2026-09-20-uploads-files-server-colocation
work_kind: implementation
---

# Files server colocation

Status: Complete

## Outcome

The copied Files SDK server setup has one customization owner in `lib/files.ts`,
while the Next route only assembles and exports handlers.

## Scope

- Move R2/S3 adapter construction from `files-storage.ts` into `files.ts`.
- Delete the one-consumer helper and update the route, registry item, typecheck
  runner, changelog metadata and generated registry payloads.
- Preserve the dynamic S3 import, server-only credentials, ACL behavior and
  installed Files SDK contract.
- Reconcile the uploads decision and inventory after the hard cut.

## Acceptance

- `files-api` installs only `route.ts` and `lib/files.ts`.
- No current source or generated registry payload references
  `files-storage.ts`.
- Installed Files SDK gateway behavior and source-first typechecks pass.
- Registry tests, source checks, changelog checks, generation and ledger checks
  pass.

## Next action

None. Source, installed Files SDK behavior, registry distribution, changelog
metadata and upload ownership history agree.

## Evidence

- `lib/files.ts` owns ACL, gateway policy and R2/S3 adapter construction; the
  route imports all server setup from that one file.
- The installed `files-sdk@2.6.0` gateway suite passes 5 tests and 35
  assertions, and the source-first installed-package typecheck passes.
- Registry source passes 15 tests and 1,344 assertions. Generation is fresh at
  317 canonical payloads with generation
  `02ce659c11d4ef5a9f1d055840217e30ec9256885d54c9080c608f737876c9c9`.
- Registry source, changelog, scoped lint, hard-cut and diff-hygiene checks pass.
- Machine-readable command outcomes and limits are recorded in
  `docs/plans/artifacts/files-server-colocation/verification.json`.
