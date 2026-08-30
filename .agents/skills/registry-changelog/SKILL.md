---
description: Author and verify Plate registry changelog entries for user-visible registry UI, kit, example, and registry metadata changes.
name: registry-changelog
metadata:
  skiller:
    source: .agents/rules/registry-changelog.mdc
---

# Registry Changelog

Use this when a task changes user-visible Plate registry output under
`apps/www/src/registry/**`: UI components, node renderers, kits, examples,
registry metadata, style dependencies, or install behavior.

This skill owns the registry changelog contract. `plate-ui` owns the trigger,
`changeset` owns package-vs-registry release-artifact classification,
`docs-creator` owns release-page topology, and `task` owns closeout. Do not
copy this schema into those skills.

## Source

Canonical source files live under:

```txt
apps/www/src/registry/changelog/entries/*.mdx
```

Generated public artifacts live under:

```txt
apps/www/src/registry/changelog/*.json
```

Never hand-edit generated changelog JSON. Edit the MDX entry source, then run
the generator.

## When Required

Add or update a registry changelog entry when a task changes user-visible
registry behavior, copied-code install shape, kit composition, examples, style
dependencies, or component rendering.

Mark it `N/A` only when the registry diff is not user-visible, such as tests,
internal task plans, mechanical rule changes, or pure generated output from an
existing changelog source.

Mixed package plus registry work may need both:

- published package user-visible delta: package changeset
- user-visible registry delta: registry changelog entry

Registry-only work under `apps/www/src/registry/**` uses the registry changelog
instead of a package changeset.

## Authoring Contract

Use one MDX file per changelog event.

```mdx
---
id: 2026-06-15-fix-editor-wrapping
date: 2026-06-15
status: draft
kind: fix
summary: "Fix editor wrapping"
change: {"type":"source","date":"2026-06-15","commits":[]}
release: {"status":"unresolved"}
diagnostics: []
---
<!-- entry: {"id":"2026-06-15-editor-wrapping-3b8c2c1a","kind":"fix","migrationNotes":[]} -->
- **`editor`**, **`editor-static`**: Fix preserved-space wrapping in editable and static editors.
```

Frontmatter:

| Field | Required | Contract |
| --- | --- | --- |
| `id` | yes | Stable event id. Prefer `YYYY-MM-DD-short-slug`. |
| `date` | yes | Event date in `YYYY-MM-DD`. |
| `status` | yes | Usually `draft` until release metadata is known. |
| `kind` | yes | `new`, `fix`, `behavior`, `wiring`, `rename`, or `remove`. |
| `summary` | yes | One user-facing sentence. No changelog voice. |
| `change` | yes | JSON object. Use `{"type":"source","date":"YYYY-MM-DD","commits":[]}` unless exact PR metadata is known. |
| `release` | yes | JSON object. Use `{"status":"unresolved"}` unless release metadata is known. |
| `diagnostics` | yes | JSON array. Use `[]` unless warning metadata is intentional. |
| `legacyRelease` | migration only | Keep only for migrated historical entries. New entries should omit it. |

Each visible bullet row may have an `entry` metadata comment immediately above
it. Use it when you need stable row id, explicit kind, or migration notes. If
you omit it, the generator can infer defaults, but explicit metadata is better
for durable changelog entries.

Row bullets must name real registry item ids in backticks:

```mdx
- **`item-name`**, **`second-item`**: User-facing summary.
```

Do not write implementation diary, test notes, internal architecture rationale,
or vague ownership prose. Users want what changed for copied registry code.

## Commands

Create a new source entry:

```bash
node tooling/scripts/generate-ui-changelog-entries.mjs \
  --new 2026-06-15-fix-editor-wrapping \
  --summary "Fix editor wrapping" \
  --items editor,editor-static \
  --kind fix
```

Regenerate public JSON:

```bash
node tooling/scripts/generate-ui-changelog-entries.mjs --write
```

Verify source and generated JSON agree:

```bash
node tooling/scripts/generate-ui-changelog-entries.mjs --check
```

Run focused generator coverage after changing the generator, schema, or
changelog source layout:

```bash
bun test tooling/scripts/generate-ui-changelog-entries.test.mjs
```

## Closeout

Before handoff:

- source entry exists or the plan records a concrete `N/A` reason
- generated JSON is updated with `--write`
- `--check` passes
- focused generator tests run when the generator/schema changed
- package changeset decision is recorded separately when package code changed
