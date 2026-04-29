# Remove Inline Suggestion Helper Plan

## Goal

Remove the old runtime inline-suggestion lookup helper and migrate remaining callers to injected suggestion state while preserving current rendering behavior.

## Scope

- Audit remaining runtime and doc references to the old helper.
- Add regression coverage for mention and inline equation under injected suggestion styling.
- Migrate callers to injected data attributes or direct suggestion APIs.
- Delete the helper if nothing depends on it.
- Regenerate registry artifacts touched by the change.

## Findings

- The remaining runtime callers were in `suggestion-kit.tsx`, `mention-node.tsx`, and `equation-node.tsx`.
- A recent learning doc still showed the old helper in a code sample and needed a refresh.
- `date-node` already uses `data-inline-suggestion` injection and is the pattern to extend.

## Phases

- [x] Audit remaining references
- [x] Add or update tests for mention and inline equation injection path
- [x] Refactor runtime code and remove helper
- [x] Refresh docs/generated registry output
- [x] Verify build, typecheck, lint, and targeted tests
