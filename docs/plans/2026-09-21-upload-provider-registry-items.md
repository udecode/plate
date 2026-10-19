---
review_scopes:
  - uploads
review_basis:
  - 2026-09-21-uploads-provider-items
work_kind: implementation
---

# Upload provider registry items

Status: Complete

## Outcome

`upload` installs provider-neutral browser UI. Consumers choose exactly one
opt-in provider recipe: browser-local ephemeral storage, Cloudflare R2, or S3.
The persistent recipes reuse one fail-closed Files SDK gateway owner.

## Scope

- Remove the server gateway dependency from the `upload` registry item.
- Add `upload-ephemeral`, `upload-r2`, and `upload-s3` registry items.
- Keep ACL, namespace, durable URL, trusted inline type and error policy in the
  shared `files-api` item.
- Replace `FILES_STORAGE_PROVIDER` branching with thin provider route assembly.
- Keep the playground on the real `upload-ephemeral` recipe.
- Update current docs, registry metadata, changelog source and generated output.

## Acceptance

- Installing `upload` includes no server route or AWS dependency.
- Installing each provider item includes `upload` and only the provider's route,
  environment contract and dependencies.
- R2 and S3 reuse the same gateway implementation without duplicated ACL or
  response policy.
- The ephemeral recipe owns object URLs and cleanup without entering persistent
  upload installs.
- Registry generation, isolated payload inspection, gateway tests, source
  checks, changelog checks, browser upload proof and ledger checks pass.

## Decisions

| Boundary | Decision | Rejected alternative |
| --- | --- | --- |
| Browser UI | `upload` owns UploadKit and Files SDK client wiring only | Pull a server route into every UI install |
| Shared server policy | `files-api` owns provider-neutral gateway policy | Duplicate security policy per provider |
| Persistent providers | Thin `upload-r2` and `upload-s3` routes select one adapter | Runtime `FILES_STORAGE_PROVIDER` branch shipping both choices |
| Browser-local provider | `upload-ephemeral` owns its explicit nonpersistent kit | Put demo code in `upload.tsx` or Plate core |

## Verification

- `bun test` passed 28 source contract, gateway, upload lifecycle and DnD tests
  with 1,431 expectations.
- The installed Files SDK runner passed five gateway tests with 35 expectations,
  and its source typecheck passed for the shared gateway plus R2 and S3 routes.
- Registry generation published 320 canonical payloads. A direct assertion over
  `upload`, `upload-ephemeral`, `upload-r2`, `upload-s3`, and `files-api` passed
  every provider-isolation and route-target check.
- Chromium passed the real Files SDK XHR flow and deployed playground ephemeral
  upload flow.
- Docs source parity, registry changelog generation, scoped lint, Plate Next
  v227 validation, workflow mirror parity and review-ledger checks passed.
- [Verification receipt](artifacts/upload-provider-registry-items/verification.json)
  records the exact commands, results and remaining live-provider limits.

## Next action

None. Live Amazon S3 remains optional deployment proof rather than a blocker for
the registry ownership change.
