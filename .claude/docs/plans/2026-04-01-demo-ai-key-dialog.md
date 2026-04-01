# Demo AI Key Dialog

## Goal

Add a dialog to the markdown streaming demo so hosted users can supply a key before testing live AI streaming, while local dev keeps the current no-dialog flow.

## Constraints

- Only gate the hosted demo flow.
- Localhost and dev should keep the current direct generate path.
- Reuse existing Plate dialog/input/button patterns.
- Keep the implementation small and testable.

## Plan

1. Inspect the current demo generate flow and key handling.
2. Add a small helper seam for hosted-key gating so behavior is testable.
3. Update the demo page to show a hosted-only key dialog and pass the key to the route.
4. Update the dev markdown stream route to honor the provided key without breaking env fallback.
5. Run focused tests, build/typecheck/lint, and verify in the demo page with `dev-browser`.

## Findings

- `apps/www/src/registry/examples/markdown-streaming-demo.tsx` posts directly to `/api/dev/markdown-stream`.
- `apps/www/src/app/api/dev/markdown-stream/route.ts` only reads server env keys today.
- `apps/www/src/registry/app/api/ai/command/route.ts` already accepts a request-body key, so that pattern exists in-repo.
- `apps/www/src/registry/components/editor/settings-dialog.tsx` is the clearest local pattern for dialog + key input UI.

## Progress

- 2026-04-01: Reloaded relevant skills after compaction and re-read the demo page, route, and existing key-input patterns.
