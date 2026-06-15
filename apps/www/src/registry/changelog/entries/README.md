# Registry changelog entries

This directory is the source for Plate UI registry changelog entries.

One file equals one changelog event. Generated public JSON lives one directory
up in `apps/www/src/registry/changelog/*.json`; do not edit that JSON by hand.

## Create an Entry

```bash
node tooling/scripts/generate-ui-changelog-entries.mjs \
  --new 2026-06-15-fix-editor-wrapping \
  --summary "Fix editor wrapping" \
  --items editor,editor-static \
  --kind fix
```

Then regenerate and verify:

```bash
node tooling/scripts/generate-ui-changelog-entries.mjs --write
node tooling/scripts/generate-ui-changelog-entries.mjs --check
```

## Shape

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

Keep prose user-facing. Do not include implementation notes, test notes, or
internal architecture rationale.

