---
module: Markdown
date: 2026-04-09
problem_type: logic_error
component: markdown_deserializer
symptoms:
  - "Date nodes stored locale-shaped strings like `Mon Mar 23 2026` instead of one stable machine value"
  - "Renderers parsed free-form date strings with `new Date(...)`, which risks timezone drift and inconsistent labels"
  - "Legacy `<date>...</date>` input had no explicit fallback path when the text could not be normalized safely"
root_cause: logic_error
resolution_type: code_change
severity: medium
tags:
  - markdown
  - date
  - mdx
  - serializer
  - deserializer
  - legacy-compat
---

# Date payload migrations must canonicalize safe values and preserve unparseable legacy text

## Problem

Plate's date surface mixed three different ideas into one loose string:

- canonical stored value
- rendered label
- legacy markdown payload

That let `toDateString()` leak into node data, made renderers parse whatever
string happened to be there, and left no honest branch for legacy date text
that could not be normalized safely.

## What Didn't Work

- Treating the rendered chip label as if it were the storage contract
- Upgrading the UI without first locking one canonical node value
- Assuming every legacy `<date>...</date>` body should parse into a real date
- Forcing a markdown wire-shape migration at the same time as the node-contract
  fix

## Solution

Split the problem in the right order:

1. make the node contract canonical
2. dual-read legacy markdown
3. switch the writer only after the canonical contract is stable
4. preserve truly unparseable legacy text as explicit fallback data

The new contract is:

- `node.date` stores canonical `YYYY-MM-DD`
- markdown writes canonical dates as `<date value="YYYY-MM-DD" />`
- markdown also accepts `<date value="YYYY-MM-DD" />` on read
- markdown still accepts legacy `<date>...</date>` child-text on read
- legacy child text that does not normalize safely stays on `rawDate`

The normalization helper changed the insert/render path from this:

```ts
date: date ?? new Date().toDateString()
```

to this shape:

```ts
const normalized = normalizeDateValue(date ?? new Date());

{
  ...normalized,
  type: editor.getType(KEYS.date),
}
```

## Why This Works

It separates the stable contract from the migration details.

- Safe legacy values get upgraded into one machine-readable shape.
- Unsafe legacy values are not silently reinterpreted into the wrong day.
- Renderers derive labels from canonical data instead of treating display text
  like storage.
- The markdown writer upgrades canonical values into one explicit wire shape
  without breaking legacy child-text reads.

## Prevention

- Pick the canonical node value before touching the picker UI.
- Dual-read old markdown before changing the write shape.
- Once the canonical node value is stable, migrate the writer to one explicit
  canonical form instead of keeping two current write paths forever.
- Never coerce unknown legacy date text into a calendar day just because
  `Date.parse` happens to accept it.
- When a migration cannot normalize safely, preserve the literal source on an
  explicit fallback branch.
- Test all three paths:
  - canonical date value
  - safe legacy normalization
  - unparseable legacy fallback

## Verification

These checks passed:

```bash
bun test packages/date/src/lib/transforms/insertDate.spec.tsx packages/date/src/lib/BaseDatePlugin.spec.tsx packages/date/src/lib/utils/dateValue.spec.ts packages/markdown/src/lib/dateElement.spec.ts apps/www/src/registry/ui/date-node.spec.tsx apps/www/src/registry/ui/date-node-static.spec.tsx
pnpm turbo build --filter=./packages/utils --filter=./packages/date --filter=./packages/media --filter=./packages/markdown --filter=./apps/www
pnpm turbo typecheck --filter=./packages/utils --filter=./packages/date --filter=./packages/media --filter=./packages/markdown
pnpm lint:fix
```

Browser verification also passed against `http://127.0.0.1:3000/docs/date`
through `dev-browser`, confirming the page loaded and still surfaced the date
UI content.

## Related Issues

- [markdown-editing-spec.md](../../editor-behavior/markdown-editing-spec.md)
- [editor-protocol-matrix.md](../../editor-behavior/editor-protocol-matrix.md)
- [markdown-parity-matrix.md](../../editor-behavior/markdown-parity-matrix.md)
