# plate-next autoformat package review

Objective:
Close the next Plate Next package packet by reviewing `packages/autoformat` file by file and cutting it if it is only compatibility sludge.

Completion threshold:
All `packages/autoformat` tracked files are reviewed and either score `100` or defer with owner/proof. The compatibility package is deleted, active Core/Utils/release metadata references are gone, focused resolver proof passes, `check:core` passes, stale non-package references are recorded, and this plan passes `check-complete`.

Verification surface:
Package manifest, active source/package/release metadata audits, focused Core resolver test, Core/Utils typecheck and lint, Plite release script contract, `pnpm check:core`, and final autogoal plan check.

Constraints:
Package review mode only. No docs rewrite, no template rewrite, no generated registry rewrite, no `apps/www` proof, no broad package migration, no commit.

Boundaries:
Allowed edits were `packages/autoformat`, the smallest Core/Utils owner needed to remove the deleted package sentinel, and changeset metadata required by the release contract. Docs/templates/generated references are recorded as out-of-scope stale surfaces.

Blocked condition:
None. The only blocker found was duplicate Core major changesets, and it was repaired by merging the duplicate release note into the existing Core major changeset.

Reboot status:
Current. Resume from `packages/callout` unless the user asks for docs/template cleanup first.

Open risks:
Out-of-scope docs/templates/generated files still mention the removed autoformat package. They need a docs/template/generated cleanup lane, not a package review patch.

## Checkpoint Zero

- [x] User target captured: `$plate-next next pkg`.
- [x] Mode: package review autopilot.
- [x] Package selected: `packages/autoformat`.
- [x] Stop condition: do not move to the next package until every package row is score `100` or explicitly deferred.
- [x] Non-goals: no docs rewrite, no template rewrite, no `apps/www` proof, no broad package sweep, no commit.
- [x] Proof target: source audit, focused Core resolver proof, Core/Utils type/lint, and `pnpm check:core` because Core/Utils were touched.
- [x] Final handoff must include changed files, proof, deferred stale surfaces, and next package.

Work Checklist:

- [x] Select next package from current package-review sequence.
- [x] Create package file manifest.
- [x] Review every package file row.
- [x] Decide hard-cut versus migration.
- [x] Remove the compatibility package.
- [x] Remove required Core/Utils compat hooks.
- [x] Repair release metadata required by package removal and release contract.
- [x] Run related scoped source sweep.
- [x] Run focused proof.
- [x] Run `check:core`.
- [x] Record out-of-scope docs/template/generated stale references.
- [x] Run final plan check.

Phase / pass table:

| Phase | Status | Evidence |
| --- | --- | --- |
| Package selection | done | `packages/autoformat` was the smallest stale package candidate |
| Manifest | done | 6 tracked rows from `git ls-files packages/autoformat` |
| Implementation | done | compatibility package and sentinel hooks deleted |
| Scoped sweep | done | active source/package/release metadata audit returned 0 matches |
| Proof | done | focused resolver test, Core/Utils type/lint, release contract, `check:core` |
| Handoff | done | stale docs/template/generated references recorded |

## Verdict

`@platejs/autoformat` was an inert deprecated compatibility package. Keeping it would preserve a fake public surface, so the best Plate v2 migration is `hard-cut`.

## Package Manifest

Manifest command: `git ls-files packages/autoformat | sort`

Expected rows: 6
Actual rows: 6
Checked rows: 6
Deferred package rows: 0

| Done | File | Score | Verdict | Evidence | Next |
| --- | --- | ---: | --- | --- | --- |
| [x] | `packages/autoformat/CHANGELOG.md` | 100 | hard-cut | compatibility-only package note | deleted |
| [x] | `packages/autoformat/package.json` | 100 | hard-cut | package exported only inert `AutoformatPlugin` | deleted |
| [x] | `packages/autoformat/src/index.ts` | 100 | hard-cut | barrel only re-exported inert plugin | deleted |
| [x] | `packages/autoformat/src/plugin.ts` | 100 | hard-cut | inert plugin created with dead `KEYS.autoformat` | deleted |
| [x] | `packages/autoformat/tsconfig.build.json` | 100 | hard-cut | package removed | deleted |
| [x] | `packages/autoformat/tsconfig.json` | 100 | hard-cut | package removed | deleted |

## Required Owner Cleanup

| Done | File | Score | Verdict | Evidence | Next |
| --- | --- | ---: | --- | --- | --- |
| [x] | `packages/core/src/internal/plugin/resolvePlugins.ts` | 100 | hard-cut | removed resolver sentinel for deleted `AutoformatPlugin` | keep |
| [x] | `packages/core/src/internal/plugin/resolvePlugins.spec.tsx` | 100 | hard-cut | removed test for deleted compatibility guard | keep |
| [x] | `packages/utils/src/lib/plate-keys.ts` | 100 | hard-cut | removed `KEYS.autoformat`; no active source use remains | keep |
| [x] | `.changeset/pre.json` | 100 | hard-cut metadata | removed deleted package from prerelease initial versions | keep |
| [x] | `.changeset/plugin-portal-scoped-api.md` | 100 | release contract cleanup | merged duplicate Core major release note | keep |
| [x] | `.changeset/prepare-v54-beta-core.md` | 100 | delete duplicate | duplicate Core major changeset violated release contract | deleted |

## Related Scoped Sweep

Active source audit:

```bash
rg -n "AutoformatPlugin|KEYS\\.autoformat|plugins\\.autoformat|@platejs/autoformat|packages/autoformat" packages/core/src packages/utils/src .changeset pnpm-lock.yaml package.json pnpm-workspace.yaml --glob '!**/node_modules/**' --glob '!**/dist/**'
```

Result: 0 active source/package/release metadata matches.

Package deletion audit:

```bash
test ! -e packages/autoformat
```

Result: `packages/autoformat deleted`.

Out-of-scope stale docs/templates/generated references discovered by package review:

- `content/docs/(guides)/plugin-input-rules.mdx`
- `content/docs/migration/index.cn.mdx`
- `content/docs/migration/v48.mdx`
- `docs/editor-behavior/editor-protocol-matrix.md`
- `docs/editor-behavior/markdown-parity-matrix.md`
- `docs/editor-behavior/master-roadmap.md`
- `docs/research/decisions/link-automd-belongs-to-the-link-interaction-lane.md`
- `docs/research/open-questions/text-substitution-autoformat-authority.md`
- `docs/solutions/best-practices/autoformat-lanes-must-split-package-owned-rules-from-current-kit-shorthand.md`
- `docs/solutions/best-practices/link-automd-should-use-autoformat-as-a-host-while-link-owns-semantics.md`
- `docs/solutions/ui-bugs/2026-04-02-blockquote-autoformat-must-wrap-nested-quotes.md`
- `apps/www/public/r/migration-v48-docs.json`
- `apps/www/public/r/plugin-input-rules-docs.json`
- `apps/www/public/r/registry-docs.json`
- `apps/www/public/r/registry.json`
- `templates/plate-playground-template/package.json`
- `templates/plate-playground-template/bun.lock`

Decision: defer to docs/template/generated surface cleanup. Package review mode must not rewrite those surfaces unless explicitly requested.

## Proof

- [x] `pnpm install` passed and refreshed workspace package discovery.
- [x] `pnpm --filter @platejs/core exec bun test --preload ../../config/plite-source-test-setup.ts ./src/internal/plugin/resolvePlugins.spec.tsx` passed: 40 tests.
- [x] `pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils` passed.
- [x] `pnpm --filter @platejs/core lint` passed.
- [x] `pnpm --filter @platejs/utils lint` passed.
- [x] `pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts ./test/release-scripts-contract.ts` passed: 8 tests.
- [x] `pnpm check:core` passed after merging the duplicate Core major changeset.
- [x] `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-09-plate-next-autoformat-package-review.md` passed.

Verification evidence:

- Focused resolver test: 40 pass, 0 fail.
- Core/Utils typecheck: passed.
- Core lint: passed.
- Utils lint: passed.
- Release script contract: 8 pass, 0 fail.
- `pnpm check:core`: passed after the duplicate Core major changeset repair.
- Final autogoal plan check: passed.

## Keep / Revert / Quarantine

Keep.

Reason: the package was a deprecated inert compatibility shell. The remaining package behavior lives in feature-owned `inputRules`, local copied shortcut kits, and Core input-rule infrastructure.

## Next

Next best package: `packages/callout`. It is smaller than link/list/table and likely exposes the next real Plate product-shape drift without dragging the whole migration graph at once.
