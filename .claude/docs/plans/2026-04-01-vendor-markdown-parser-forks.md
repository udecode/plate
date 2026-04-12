# Vendor Markdown Parser Forks Into `@platejs/markdown`

## Goal

Move the local `remark-parse` and `mdast-util-from-markdown` forks out of top-level private workspace packages and into `packages/markdown` as internal vendor code.

## Why

- Only `@platejs/markdown` consumes these forks today.
- Keeping them as top-level private workspace packages adds package-graph noise.
- The forked parser code is an implementation detail of markdown deserialization, not a shared public surface.

## Constraints

- Preserve current streaming markdown and MDX behavior.
- Keep the fork internal to `packages/markdown`.
- Remove the dead top-level package surfaces cleanly.
- Re-run the package build-first verification flow after rewiring imports.

## Phases

- [in_progress] Confirm current ownership, imports, and package-graph usage
- [pending] Move fork sources into `packages/markdown`
- [pending] Rewrite imports and package manifests
- [pending] Delete obsolete top-level private packages
- [pending] Run targeted tests plus install/build/typecheck/lint

## Findings

- The only direct consumer is `packages/markdown/src/lib/deserializer/deserializeMd.ts`.
- `packages/remark-parse` currently depends on `@platejs/mdast-util-from-markdown`, so both forks should move together.
- This is a good fit for an internal `vendor/` or `lib/vendor/` layout, not a new public export.

## Verification Plan

- `pnpm install`
- `pnpm turbo build --filter=./packages/markdown`
- `pnpm turbo typecheck --filter=./packages/markdown`
- `pnpm lint:fix`
- targeted tests for markdown/streaming parser seams
