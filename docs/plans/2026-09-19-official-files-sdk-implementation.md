---
review_scopes:
  - uploads
review_basis:
  - 2026-09-19-uploads-official-files-sdk
work_kind: implementation
---

# Official Files SDK implementation

Status: Complete

Objective: Execute the [accepted design](2026-09-19-official-files-sdk-integration.md) across Plate package, copied application, registry, docs and proof. Preserve draft document identity and history while replacing the generic transport and UploadThing wiring.

Acceptance: one optional `platejs/upload` feature, direct FilesClient upload, stable application-owned URLs, editor-owned request lifetime, clean optional imports, copied UploadKit and private gateway, migrated consumers, current-state teaching, generated distribution and final source-bound proof. Correct 401/403 denial from the installed SDK or an explicit app response boundary is a release gate.

Flow: Plate Feature, complete cross-layer implementation. The prior design probe is the pre-acceptance scale result; final production-path rerun remains required.

## Feature Manifest

| Surface | Applies | Owner | Artifacts | Consumer | Proof | Status |
| --- | --- | --- | --- | --- | --- | --- |
| API | yes | Best API / Task | UploadPlugin public contract | package users | inferred type and behavior checks | complete |
| Package | yes | Plate Plugin Creator / Task | `platejs/upload` | package users | partition, package, optional-peer checks | complete |
| React adapter | yes | Plate UI / Task | `platejs/upload/react` | editor views | React drop tests | complete |
| Registry UI | yes | Plate UI / Task | copied file controls | installed consumers | copied tests and browser | complete |
| Composition | yes | Plate UI / Task | UploadKit / MediaKit split | demo, static, DnD | install and static checks | complete |
| Scale proof | yes | Benchmark / Task | design probe and production rerun | editor owners | frozen cohort rerun | complete |
| Registry metadata/examples | yes | Plate UI / Task | Files SDK items and examples | Base/Radix installers | build/install checks | complete |
| Docs | yes | Plate Docs / Task | media/files guides | users | docs checks | complete |
| Release artifacts | yes | Changeset / Registry Changelog / Task | package and registry notes | release readers | validators | complete |
| Proof | yes | Verify Plate / Task | focused, package, browser, gateway receipts | maintainers | exact commands | complete |
| Plate Next attestation | no | Plate Next / Task | N/A: focused feature change in existing host package | maintainers | N/A: report current package status and changed-file proof | N/A: focused change, no full package review |
| Review/handoff | yes | Task | final inspection and ledger outcome | user | source review and plan check | complete |

## Package boundary contract

| Contract | Decision | Evidence |
| --- | --- | --- |
| shared Plate host | `platejs` remains the host; no new workspace package | manifest check |
| Plite ownership | features use relative Plate owners, no new direct Plite dependency | import audit |
| external dependency ownership | Files SDK is an optional peer used only by `files` | manifest and entrypoint graph |
| entrypoint runtime | `files` headless and `files/react` client | DAG and release boundaries |
| Oxlint coverage | existing package globs or exact new override | scoped lint |

## Execution sequence

- [x] Implement/migrate the package owner and public contract, preserving draft/root/history laws.
- [x] Implement the copied gateway and prove authorization, upload, download and installed-package behavior.
- [x] Migrate copied UI, kits, registry items and consumers; remove UploadThing wiring.
- [x] Update current-state docs, schema/registry/release/doctrine owners.
- [x] Run focused and closure proof, final production scale probe, inspect the resulting ownership, and record the implementation outcome.

Post-completion ownership correction:

- [x] Colocate the upload renderer, preview, picker, and `UploadKit` in
  `files.tsx`; remove the one-consumer `media-upload` registry item and reverse
  dependency.
- [x] Regenerate copied registry and changelog output, refresh public teaching,
  verify focused component behavior and workflow mirrors, then record a new
  source-bound execution outcome.

Correction proof:

- `bun test ./apps/www/src/registry/components/editor/upload.spec.tsx ./apps/www/src/registry/components/editor/upload.lifecycle.spec.tsx` — 5 pass.
- `pnpm --filter www build:registry --check` and the registry source checker — pass; the standalone `media-upload` payload is absent.
- docs source parity and registry changelog checks — pass.
- focused Ultracite check — pass.
- Plate Next v222 validation and generated Plate UI source/mirror comparison — pass.
- The www package-integration TypeScript check still stops at the existing
  `HistoryPlugin` TS2589 recursive-instantiation error before providing a clean
  whole-project result.

Proof limits: the browser picker/XHR path, copied Base and Radix installations, SDK router integration, deterministic R2/S3 gateway behavior, package behavior and frozen scale cohorts are verified. No live R2/S3 account, authenticated application policy, native file drag, Firefox/WebKit run or production deployment was exercised. The copied route therefore remains fail closed until an application supplies access policy and storage configuration. The broad `www` source typecheck reaches the pre-existing `HistoryPlugin` recursive type-instantiation limit; focused Files source checks, the `platejs` source typecheck and both clean installed-consumer builds pass.
