# Lane v54-safety report

Scope: the S2 migration part of the conversion-boundary adoption plan
(`docs/plans/2026-09-28-conversion-boundary-adoption.md`, "Safety at existing
boundaries" and amendment A4). Branch `next`, 2026-09-29. Nothing was staged or
committed.

## Outcome

- A v53 document whose link or media URL the current schema rejects now
  migrates instead of failing. Before this change, every such document threw
  `EditorSchemaValidationError: Editor element property "url" fails custom
  property validation.` in `fitDocument` and could not load.
- The existing `migrateV54` step does the cleanup. There is no new public API,
  no v55, no compatibility validator and no hidden migration. Current-version
  documents with an unsafe URL are still rejected.
- The first-party generated schema contract was regenerated. Its fingerprint
  changed from `fnv1a64:855d4d3b8ccc7706` to `fnv1a64:25a6c19579c99ec6`. The
  frozen v53 source identity `plate-v53` is unchanged.

## Behavior

The step runs inside `migrateV54`, after the profile and AST stages and before
code-block flattening. A value is unsafe when it is a string and the current
schema's own validator for that element and key rejects it. Markdown import uses
the same check (`markdownAttributes.ts` `describe` → `value.validate`). The
migration therefore follows `isStoredUrl` without keeping a second copy of the
role table.

| Legacy value | Result |
| --- | --- |
| Link (`a` → `link`) with an unsafe `url` | Unwrapped. Its label (children) stays in place. |
| Image, audio, video, file or media embed with an unsafe `url` | Replaced by a paragraph of its caption children. With no visible caption, the paragraph holds its text alternative: a file's `name`, or another media element's `alt`. With neither, the media is removed. |
| Video or media embed with an unsafe optional `sourceUrl` | The property is omitted and the media is kept. |
| Safe or empty (`''`) URL; missing media URL (the profile stage sets it to `''`) | Unchanged |
| Non-string or missing required URL | Unchanged, so it still fails closed at schema assertion |

- Cleanup is bottom-up. An unsafe link inside a caption is unwrapped before its
  media is judged.
- Named roots and every legacy suggestion revision (the accepted document and
  each proposed document) go through the same step.
- Persisted selections:
  - Every text this step moves is mapped explicitly.
  - Text it leaves in place keeps its path.
  - Only text removed with its media falls back to the diff mapping.
  - URL-stage points take precedence both in the code-block stage's input and
    in its fallback.
  - When the step changes nothing, the selection path and its cost are exactly
    as before, with no extra diff.

## Files

Changed or created by this lane:

- `packages/platejs/src/migrations/migratePlateV54Urls.internal.ts` (new, 252
  lines). The stage is at `:41` and the schema-validator check at `:59`. Link
  unwrap is at `:97`, the media fallback at `:120` (text alternative at `:122`),
  source URL omission at `:146` and point mapping at `:235`.
- `packages/platejs/src/migrations/migratePlateV54.ts`:
  - stage wiring at `:66`
  - the `migrateV54` JSDoc at `:86-90`, which now states the cleanup
  - the selection chain through the URL stage (`mapThroughUrls`) at `:97`
  - at `:146`, the step returns a mapper when the URL stage has one
- `packages/platejs/src/migrations/migratePlateV54Urls.spec.ts` (new, 15 tests).
- `apps/www/src/registry/components/editor/plugins.schema.json`, regenerated
  with `pnpm --filter www editor:generate` and not edited by hand. The diff has
  exactly two parts:
  - The fingerprint changed in 2 places.
  - `validationVersion: 1` was added to 8 descriptors: `url` on link, image,
    audio, video, file and mediaEmbed, and `sourceUrl` on mediaEmbed and video.
  - `plugins.generated.ts` came out byte-identical.
- `docs/research/probes/2026-09-28-conversion-boundary/lanes/v54-safety/kit-and-selection.probe.test.tsx`
  holds the lane evidence:
  - the full first-party kit identity, bound to the committed contract
  - the selection edge cases
  - a repro of a pre-existing gap

The `.internal` suffix keeps the new file out of barrels, so `pnpm brl` does not
apply. The CLI `dist` was current: no `packages/cli/src` file was newer than
`dist/bin.js`, and the CLI had no uncommitted changes.

## Commands and results

| Command | Result |
| --- | --- |
| `bun test ./packages/platejs/src/migrations` (baseline, before changes) | 64 pass, 0 fail, 149 expects, 6 files |
| New spec, before the implementation (red) | 2 pass, 12 fail. Every failure was `EditorSchemaValidationError … "url"` (or `"sourceUrl"`) `fails custom property validation`. |
| `bun test ./packages/platejs/src/migrations` (final) | 79 pass, 0 fail, 182 expects, 7 files |
| `bun test …/migratePlateV54Urls.spec.ts` (final) | 15 pass, 0 fail, 33 expects |
| platejs `pnpm test:entrypoint:migrations` | 79 pass, 0 fail |
| platejs `pnpm typecheck:entrypoint:migrations` | exit 0 |
| platejs `pnpm lint:entrypoint:migrations` | exit 0, 18 files |
| `npx tsc -p packages/platejs/tsconfig.json --noEmit` | exit 1 with 206 `error TS` lines repo-wide, from other lanes' in-flight work. None are in this lane's files. 5 are in unmodified migration specs: `documentMigrations.spec.ts:190`, `migratePlateV54.spec.ts:82`, `migratePlateV54Ast.spec.ts:290,1147`, `migratePlateV54CodeBlocks.spec.ts:55`. Those are pre-existing test-wrapper typings. |
| `npx oxlint` / `npx oxfmt --check`, per file, on the 3 package files | exit 0 / exit 0 |
| packages/cli `bun test test/run-migration.test.ts` (runs `migrateV54` end to end) | 9 pass, 0 fail |
| apps/www `pnpm editor:check`, before regeneration | exit 1: `Generated Plate artifacts are stale: plugins.schema.json` |
| apps/www `pnpm editor:generate`, then `pnpm editor:check` | generated, then exit 0 |
| apps/www `pnpm api-reference:check` | exit 0. It reads built declarations; see gap 4. |
| Lane probe `bun test ./docs/…/lanes/v54-safety/kit-and-selection.probe.test.tsx` | 3 pass, 0 fail, 8 expects |

The spec covers the following:

- Safe values: https, relative, `mailto:`, raster `data:`, `blob:`, file paths
  and the embed URL.
- Empty values: `''` and a missing media URL.
- Unsafe links: `javascript:`, a control-character variant (`java\tscript:`)
  and `data:text/html`, plus a `vbscript:` link inside a caption.
- Unsafe media by role:
  - an SVG `data:` image
  - `javascript:` audio
  - a `data:` video
  - a `mailto:` file, which keeps its caption
  - a `data:application/pdf` file with no caption, which keeps its name
  - a relative embed URL
  - removal when the caption, alt text and file name are all empty
- Each migrated output is reloaded as a current envelope and must come back
  unchanged, which proves it passes the current schema.
- Selections:
  - A range from an untouched paragraph into an unwrapped label.
  - A code-line selection after removed media moves the code block.
- Legacy suggestions: the accepted and proposed projections both keep the
  label, and no `javascript:` remains.
- Fail-closed cases:
  - A current-version document with an unsafe URL throws the validation error.
  - A stored v54 envelope from a schema without URL validators throws
    `Unknown schema fingerprint for plate@54.`

The probe runs the full `EditorKit` target (`document-migration-demo@54`). Its
migrated identity fingerprint equals the committed contract fingerprint, and the
output reloads as current. An unsafe image with a legacy caption becomes
`paragraph("Legacy media caption")`.

## Decisions applied

- The team lead decided on 2026-09-29 that a file's `name` is its text
  alternative. A file with an unsafe URL and no visible caption becomes a
  paragraph of its `name`.
- The `migrateV54` JSDoc now states the cleanup, as the team lead authorized.

## Gaps

1. **Pre-existing and outside A4.** A caret in a block before a v53 media
   element whose legacy `caption` migrates into its children collapses to
   offset 0. It happens with safe URLs and no neutralization, so the cause is
   the profile-stage caption migration diff. The probe's gap-repro test pins it.
   It belongs to the migration profile's selection mapping.
2. **Fallback paragraph properties.** The paragraph that replaces neutralized
   media is fresh, as in import. The media's block properties (`id`,
   indent/list membership, alignment) are not carried over.
3. **Public docs.** `content/docs/(guides)/document-model.mdx:51` and
   `.cn.mdx:50-51` do not yet mention the cleanup. The team lead places them;
   suggested sentences follow.
4. **API reference manifest.**
   - `apps/www/src/generated/api-reference-manifest.json` is generated from
     packed declarations (the `platejs` package's `dist` build output, which is gitignored). It
     still carries the old one-line `migrateV54` sentence, and
     `api-reference:check` passes.
   - After the next `platejs` build, run `pnpm --filter www api-reference` to
     pick up the new JSDoc. Until then, `api-reference:check` fails, and www
     `typecheck` runs that check.
5. **Contract freshness.** `plugins.schema.json` reflects the working tree on
   2026-09-29. Any later schema change needs another
   `pnpm --filter www editor:generate`. `editor:check` gates it, and www
   `typecheck` runs that check. The probe reads the committed contract, so it
   keeps working.
6. **No migration diagnostics.** Migration steps have no diagnostic channel,
   which is what A4 intends. Removing media is not reported anywhere.

## Suggested sentences

- `content/docs/(guides)/document-model.mdx:51`. Append this after the
  `migrateV54` sentence:
  "Links and media whose stored URL the current schema rejects keep their
  label, caption, alt text or file name as ordinary content."
- `content/docs/(guides)/document-model.cn.mdx:50-51`. Append this after the
  sentence that ends "…合并为一个带换行符的文本子节点。":
  "如果链接或媒体存储的 URL 被当前 Schema 拒绝，迁移会将其链接文本、标题、`alt` 文本或文件名保留为普通内容。"
  This follows existing .cn terms: 标题 for caption, 链接文本 for link text,
  and `alt` kept as code.
- The `migrateV54` JSDoc, already applied at `migratePlateV54.ts:86-90`:
  "Upgrade the frozen first-party Plate v53 document profile to v54. Links and
  media whose stored URL the current schema rejects keep their label, caption,
  alt text or file name as ordinary content."
