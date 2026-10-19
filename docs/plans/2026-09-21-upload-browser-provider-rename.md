---
review_scopes:
  - uploads
review_basis:
  - 2026-09-21-uploads-browser-provider-naming
work_kind: implementation
---

# Browser upload provider rename

Status: Complete

## Outcome

Name the browser-local upload recipe for the boundary it implements:
`upload-browser`, `createBrowserUploadKit`, and `upload/browser.ts`.

## Acceptance

- Current source, docs, examples, changelog source and generated registry output
  use the browser name.
- `upload-ephemeral` and `createEphemeralUploadKit` have no compatibility alias.
- Object URL creation, URL admission and disposal cleanup remain unchanged.
- Registry generation, source contracts, affected formatting and review
  recording pass.

## Constraints

- Preserve immutable prior review and execution records that describe the old
  name at the time they were recorded.
- Do not widen this naming correction into upload lifecycle or UI changes.

## Evidence

- [Verification receipt](artifacts/upload-browser-provider-rename/verification.json)
  records the commands, results and external workspace limits.
- `www` typecheck passed editor generation, API reference, docs source,
  registry freshness, docs parity, registry source and route type generation.
  Its final workspace TypeScript phase is blocked by concurrent input-rule and
  math errors outside upload source.
- `bun test apps/www/src/registry/registry.test.ts` passes 16 tests and 1,372
  expectations.
- Focused Ultracite checks pass for all renamed TypeScript and TSX sources.
- The generated `upload-browser` payload contains `createBrowserUploadKit` and
  `upload/browser.ts`; no `upload-ephemeral` payload or live-source reference
  remains.
- Review recording and rendering pass. The global ledger check is blocked by
  an unrelated stale `browser/media-caption` inventory hash.
- `git diff --check` passes.

## Next action

None. The unrelated workspace TypeScript and media-caption ledger failures
remain with their active owners.
