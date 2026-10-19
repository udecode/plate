---
review_scopes:
  - uploads
review_basis:
  - 2026-09-20-uploads-files-server-colocation
work_kind: verification
---

# R2 live verification

Status: Complete

## Outcome

The copied Files SDK server owner and Plate gateway complete a live Cloudflare
R2 upload, read and cleanup round trip with user-provided credentials.

## Scope

- Use `createFilesStorage`, `createFilesGateway` and `createFilesClient` from the
  current source and installed `files-sdk@2.6.0` graph.
- Upload one unique temporary object through the gateway's bounded R2 proxy
  path.
- Verify direct storage read, durable gateway read, byte range read and signed
  download.
- Delete the object and prove it no longer exists.
- Keep credentials, signed URLs and the generated object key out of artifacts.

## Acceptance

- The gateway upload completes against the supplied R2 bucket.
- Full, ranged and signed downloads return the exact uploaded bytes.
- Cleanup succeeds and no probe object remains.
- No credential is written to the repository or retained in the proof artifact.

## Next action

None. The current private R2 recipe has direct live-provider proof.

## Evidence

- The gateway performed presign, bounded proxy PUT and completion as three
  application requests; the R2 adapter reported `r2-http`.
- A 16-byte object round-tripped through direct storage and durable gateway
  reads. The byte range returned HTTP 206 and the signed download returned HTTP
  200.
- The temporary object was deleted and a subsequent existence check returned
  false.
- Sanitized results and remaining limits are recorded in
  `docs/plans/artifacts/r2-live-verification/result.json`.
