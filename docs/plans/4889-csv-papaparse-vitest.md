# Issue 4889

## Goal

Fix `@platejs/csv` so native ESM consumers like Vitest do not crash on `papaparse` CJS interop.

## Source Of Truth

- GitHub issue: `#4889`
- Title: `@platejs/csv breaks Vitest due to CJS/ESM interop issue with papaparse`

## Scope

1. Inspect current `@platejs/csv` papaparse imports and nearby tests/patterns.
2. Check `docs/solutions/` for relevant learnings.
3. Add the smallest regression test that fails for the current import shape.
4. Implement the minimal interop-safe fix.
5. Verify with targeted tests and required package checks.
6. Post back to the GitHub issue if the fix lands cleanly.

## Findings

- Issue report says `@platejs/csv/dist/index.js` contains `import { parse } from "papaparse";`.
- Native ESM loading under Vitest/Node fails because `papaparse` is CommonJS.
- Reproduced locally with `node --input-type=module -e "import('/Users/zbeyens/git/plate/packages/csv/dist/index.js')"` before the fix.
- Existing CSV learnings already covered a nearby `papaparse` shape bug in `deserializeCsv`, so this fix stayed in the same module and added package-surface coverage.
- Bun can mask this class of issue because `process.execPath` inside Bun tests points at Bun, not Node. The regression test must invoke `node` explicitly.

## Progress

- [x] Fetched issue and comments.
- [x] Classified work as a non-trivial bug fix.
- [x] Inspect code/tests/docs.
- [x] Add failing regression test.
- [x] Implement fix.
- [x] Verify.
- [ ] Sync back to issue.

## Verification

- `bun test packages/csv/src/lib/esmInterop.spec.ts` after the build: pass
- `bun test packages/csv/src/lib/deserializer/utils/deserializeCsv.spec.ts packages/csv/src/lib/CsvPlugin.spec.ts`: pass
- `bun test packages/csv/src/lib/esmInterop.spec.ts packages/csv/src/lib/deserializer/utils/deserializeCsv.spec.ts packages/csv/src/lib/CsvPlugin.spec.ts`: pass
- `pnpm install`: pass
- `pnpm turbo build --filter=./packages/csv`: pass
- `pnpm turbo typecheck --filter=./packages/csv`: pass
- `pnpm exec biome check packages/csv/src/lib/esmInterop.spec.ts packages/csv/src/lib/deserializer/utils/deserializeCsv.ts packages/csv/src/lib/deserializer/utils/deserializeCsv.spec.ts packages/csv/src/lib/CsvPlugin.spec.ts`: pass
- `pnpm lint:fix`: failed on unrelated `.codex/skills/claude-permissions-optimizer/scripts/extract-commands.mjs` lint errors
