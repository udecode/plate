# Fix Code Block Language Rehighlight

## Goal

Make code-block syntax highlighting refresh for the whole block immediately after `lang` changes.

## Plan

- Add regression coverage around `withCodeBlock` language changes.
- Update `withCodeBlock.apply` to detect real `lang` transitions, clear cache, then trigger `editor.api.redecorate()`.
- Verify with targeted tests, package build, package typecheck, and `lint:fix`.

## Notes

- Package-level fix only.
- No registry UI changes.
- Type cleanup: `redecorate` now lives on the base `SlateExtensionPlugin` API as a no-op, so shared plugins can call `editor.api.redecorate()` without local casts.
- Verification:
  - `bun test packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.spec.tsx packages/code-block/src/lib/withCodeBlock.spec.tsx`
  - `pnpm install`
  - `pnpm turbo build --filter=./packages/core --filter=./packages/code-block`
  - `pnpm turbo typecheck --filter=./packages/core`
  - `pnpm turbo typecheck --filter=./packages/core --filter=./packages/code-block` failed on broader existing `@platejs/code-block` package type errors outside this cleanup
  - `pnpm lint:fix`
