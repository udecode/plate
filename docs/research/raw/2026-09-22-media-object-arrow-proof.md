# Media object arrow navigation proof, 2026-09-22

The current `/blocks/editor-ai` source reproduced three failures before the repair: Right from the paragraph before an image entered caption text without selecting the image; Right on a clicked image selection did not move; Up at caption start moved to the preceding paragraph. The focused browser regression and Plite horizontal object test failed before code changes.

Final-source observations:

| Check | Result |
| --- | --- |
| `bun run test:react test/react/object-selection.test.tsx test/react/caret-engine-contract.test.ts test/react/content-root-navigation-contract.test.ts test/react/keyboard-input-strategy-contract.test.ts` from `packages/plitejs` | 4 files, 86 tests passed |
| `pnpm --filter plitejs typecheck` | 13/13 tasks passed |
| `pnpm exec ultracite check` on both changed Plite source files and both changed test files | Passed |
| `PLAYWRIGHT_BASE_URL=http://localhost:3297 pnpm --filter www test:www-browser:chromium media-caption.spec.ts` | 5/5 passed on source-backed dev server |
| The same www browser command with `--grep 'arrow keys traverse the image owner'`, after restarting the source-backed dev server on final source | 1/1 passed |
| `pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/navigation-bidi.test.ts` | 3/3 passed on managed build |

The browser case asserts paragraph-end → image `NodeSelection` → caption `TextSelection` and reverse, image owner Down/Up, and empty file caption traversal between image and audio owners. It also asserts that the selected owner has no DOM range. The preexisting image-caption browser case and Plite object case cover Delete after owner selection.

The full `pnpm --filter www typecheck` was attempted twice. The first reached TypeScript and failed in unrelated edited `code-block.format.spec.tsx` and `code-block.tsx`. The second stopped earlier in registry parsing at an unrelated literal `+type HighlightMode` at `code-block.tsx:466`. These failures do not provide a passing app-wide typecheck; that gate remains open until those concurrent code-block edits are repaired. The media route and exact reporter interaction passed on the final source independently.
