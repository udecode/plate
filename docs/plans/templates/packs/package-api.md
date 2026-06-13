# package-api pack

Use this pack when work touches published packages, exports, public API shape,
package boundaries, release artifacts, or package-level type/build behavior.

This pack owns the release-artifact decision. Do not create a separate
`changeset` pack:

- published package user-visible delta -> load `changeset` and add or update a
  `.changeset/*.md` file
- registry-only work under `apps/www/src/registry/**` -> update
  `tooling/data/plate-ui-changelog.mdx` and run
  `node tooling/scripts/generate-ui-changelog-entries.mjs --write`
- internal-only, docs-only, agent-only, or no user-visible delta from `main` ->
  record `N/A: <reason>`

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Package/API pack selected | pending | pending |
| Public surface or package boundary identified | pending | pending |
| Release artifact path selected | pending | Choose one: `.changeset`, registry changelog, or `N/A: no published user-visible delta` |
| `changeset` skill loaded when `.changeset` is required | pending | pending |
| Barrel/export impact decision recorded | pending | pending |

Work Checklist:
- [ ] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [ ] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [ ] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [ ] Package/API pack: registry-only work updates `tooling/data/plate-ui-changelog.mdx` and generated `/registry/changelog/*` JSON instead of adding a package changeset.
- [ ] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [ ] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [ ] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [ ] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Public API / package boundary proof | pending | Source-audit public API, exports, and package boundary impact | pending |
| Release artifact classification | pending | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | pending |
| Published package changeset | pending | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | pending |
| Registry changelog | pending | If the change is registry-only under `apps/www/src/registry/**`, update `tooling/data/plate-ui-changelog.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, and do not add a package changeset | pending |
| No release artifact | pending | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | pending |
| Package typecheck/build/test | pending | Run owning package checks or record N/A with reason | pending |
| Barrel/export generation | pending | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | pending |
