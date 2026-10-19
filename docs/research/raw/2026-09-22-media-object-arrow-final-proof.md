# Final media object arrow proof, 2026-09-22

This final pass retains the original [red-to-green browser and model observations](./2026-09-22-media-object-arrow-proof.md) and adds a caret-engine fast path that avoids computed-direction reads when a plain horizontal arrow stays inside a text leaf.

After that source edit, the exact affected Plite React set passed (4 files, 86 tests), Plite source-first typecheck passed (13 tasks), changed-file `ultracite check` passed, and the managed Plite mixed-bidi Chromium suite passed (3 tests). A newly started source-backed www dev server on port 3297 served the final checkout; `PLAYWRIGHT_BASE_URL=http://localhost:3297 pnpm --filter www test:www-browser:chromium media-caption.spec.ts` passed all 5 tests. The suite includes the image owner/caption arrow traversal, owner deletion, aligned caption Enter, resize chrome, and file-selection-to-TOC interactions.

The latest full `pnpm --filter www typecheck` reached API-reference generation and stopped because the concurrently edited code-block API symbol `CodeHighlightGrammar` was neither included nor excluded. `node tooling/scripts/review-ledger.mjs check` reported an inventory identity mismatch for `ui/code-block-lowlight` after concurrent code-block changes. Neither is a passing global gate; both remain outside the media navigation implementation.
