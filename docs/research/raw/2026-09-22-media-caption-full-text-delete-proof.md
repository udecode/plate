# Full media caption text deletion proof

The reporter video shows all caption text selected before Delete, followed by
removal of the image. The browser regression reproduced that removal before the
command fix. After the fix, a native browser selection of the full caption is a
`TextSelection` at the image's direct child, and Delete leaves the same image
and URL with `[{ text: '' }]`. The caret stays in that child. Undo restores the
caption; typing over a full caption selection replaces only its text.

- `bun run test:react test/react/object-selection.test.tsx` in `packages/plitejs`:
  13 passed, including full-caption Delete and selected-owner deletion.
- `bun test ./packages/plitejs/test/command-spec.test.ts ./packages/plitejs/test/runtime-contracts.test.ts`:
  862 passed.
- `pnpm --filter plitejs typecheck`: passed.
- `pnpm exec ultracite check packages/plitejs/src/core/editor-commands.ts packages/plitejs/test/react/object-selection.test.tsx apps/www/tests/browser/media-caption-delete.spec.ts`:
  passed after formatting the new browser test.
- `pnpm --filter www typecheck`: passed, including registry freshness and both
  application TypeScript projects.
- `PLAYWRIGHT_BASE_URL=http://localhost:3298 pnpm --filter www test:www-browser:chromium media-caption-delete.spec.ts`:
  1 passed on the source-backed `/blocks/editor-ai` server.
- The run of `media-caption.spec.ts` with that regression test had six passes
  and one separate highlight-case timeout. The failing test could not click
  its first image because the image was hidden, before any highlight assertion.
  Another task owns the highlight regression.

No media rendering or highlight code changed for this repair.
