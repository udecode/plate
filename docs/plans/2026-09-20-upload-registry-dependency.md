---
review_scopes:
  - uploads
review_basis:
  - 2026-09-20-uploads-registry-dependency
work_kind: implementation
---

# Upload registry dependency closure

Status: Complete

## Outcome

Installing the copied `upload` registry item also installs its official Files
SDK gateway recipe, while the client and server code remain separate owners.

## Scope

- Add `@plate/files-api` to the `upload` item's registry dependencies.
- Remove direct `files-api` composition where `upload` already supplies it.
- Teach `upload` as the complete default installation while retaining direct
  `files-api` installation for gateway-only use.
- Regenerate and verify registry payloads, docs source, installation closure and
  the uploads review ledger.

## Acceptance

- `@plate/upload` resolves `@plate/files-api` transitively in generated registry
  output and a clean install.
- `editor-ai` does not list the same server item redundantly.
- English and Chinese upload docs install `media` and `upload` once, then explain
  that the Files API route is included.
- The separate `files-api` item and its server files remain directly installable.
- Registry source, generation, relevant tests, docs parity and ledger checks
  pass.

## Next action

None. Registry composition, copied installation, current docs, changelog and
generated output are reconciled.

## Evidence

- `upload.json` depends on `files-api.json` and `use-object-url.json`;
  `editor-ai.json` no longer declares `files-api` directly.
- A clean shadcn install from the freshly generated local registry created the
  upload component, object URL hook, Files API route, gateway and storage
  adapter from one upload request.
- Fifteen registry tests and 1,353 assertions pass. Registry source, generated
  payload freshness, API reference, Fumadocs source, bilingual docs parity,
  scoped lint and the 182-entry changelog check pass.
- The generated registry contains 318 canonical payloads with generation
  `4ec429bb709c0142fb130e5aeaef2a2c70421811f615e7e1a9451571ac83fe73`.
- Machine-readable command outcomes and limits are recorded in
  `docs/plans/artifacts/upload-registry-dependency/verification.json`.
