# Link Paste Autolink Constraints

## Status

Executed.

## Goal
Make link paste autolink stop fighting markdown source entry such as `[text](<paste>)`.

## Plan
- add failing coverage for markdown-link construction paste in `packages/link/src/lib/withLink.spec.tsx`
- tighten `withLink.insertData` so default paste autolink only fires in standalone contexts
- keep plain URL paste and selection replacement behavior that still makes sense
- add a breaking changeset for `@platejs/link`
- verify with focused tests, package build, typecheck, lint

## Result

- default URL paste autolink now stays literal inside markdown link source
  entry such as `[text](...)`
- plain rich-text URL paste still autolinks
- user code can opt back into the old eager behavior with
  `shouldAutoLinkPaste: () => true`

## Verification

- `bun test packages/link/src/lib/withLink.spec.tsx`
- `pnpm install`
- `pnpm turbo build --filter=./packages/link`
- `pnpm turbo typecheck --filter=./packages/link`
- `pnpm lint:fix`
