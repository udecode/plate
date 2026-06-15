# registry-changelog pack

Use this pack when work touches user-visible Plate registry output under
`apps/www/src/registry/**`: UI components, node renderers, kits, examples,
registry metadata, style dependencies, install behavior, or generated registry
changelog artifacts.

This pack owns the registry changelog contract only. Package release notes stay
with `changeset` / `package-api`. Release page topology stays with
`docs-creator`.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Registry changelog pack selected | pending | pending |
| User-visible registry impact classified | pending | Choose `yes` or `N/A: <reason>` |
| Source entry path selected | pending | `apps/www/src/registry/changelog/entries/<id>.mdx`, existing entry, or `N/A: <reason>` |
| Generator command selected | pending | `--new`, manual source edit, `--write`, and `--check` plan |

Work Checklist:
- [ ] Registry changelog pack: user-visible registry impact is recorded.
- [ ] Registry changelog pack: source entry exists under `apps/www/src/registry/changelog/entries/*.mdx` or N/A reason is recorded.
- [ ] Registry changelog pack: entry frontmatter follows the contract in `.agents/skills/registry-changelog/SKILL.md`.
- [ ] Registry changelog pack: row bullets name real registry item ids in backticks.
- [ ] Registry changelog pack: generated `/registry/changelog/*.json`, `index.json`, and `components.json` are updated by the generator, not by hand.
- [ ] Registry changelog pack: package changeset decision is separate when package code also changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Registry impact classification | pending | Record user-visible registry delta or N/A reason | pending |
| Registry changelog source | pending | Add/update `apps/www/src/registry/changelog/entries/*.mdx` or record N/A | pending |
| Registry changelog generation | pending | Run `node tooling/scripts/generate-ui-changelog-entries.mjs --write` when a source entry is required | pending |
| Registry changelog check | pending | Run `node tooling/scripts/generate-ui-changelog-entries.mjs --check` | pending |
| Registry generator test | pending | If generator/schema/source layout changed, run `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs`; otherwise N/A | pending |
| Registry package release split | pending | Record `.changeset`, registry changelog, both, or N/A with reason | pending |

