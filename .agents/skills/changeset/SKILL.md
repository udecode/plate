---
description: Write and verify package release changesets, registry changelog entries, and the PR’s managed auto-release choice.
name: changeset
metadata:
  skiller:
    source: .agents/rules/changeset.mdc
---

# Changeset


Release notes document user-visible changes: package changesets for published packages, and [registry changelog entries](./references/registry.md) for copied registry code under `apps/www/src/registry/**`. Concise bullets, imperative voice, user impact only.

**Core principle:** one action verb + one impact statement = one bullet.

## When To Use

Use when:

- Creating `.changeset/*.md` files
- Documenting package changes: feat, fix, breaking
- Adding registry changelog entries for copied registry components

Do not use for:

- Internal docs
- Commit messages
- PR descriptions

## Critical Rules

### 1. Core packages: no `minor`

**Forbidden:** `minor` changesets for:

- `plitejs`
- `platejs`

Use `patch` instead. `minor` on those explodes version bumps across dependents.

```yaml
# Wrong
---
"platejs": minor
---

# Correct
---
"platejs": patch
---
```

Only real breaking changes get `major`.

### 2. One package per file

Never combine packages in one changeset.

```bash
# Wrong
---
"platejs": patch
"@platejs/cli": patch
---

# Correct
.changeset/plate-fix-types.md
.changeset/cli-add-command.md
```

### 3. Always relative to the release baseline, never last commit

NEVER write a changeset relative to the last commit, staged diff, current
working tree, branch-local plan, or the change you just made. Those are agent
breadcrumbs, not release truth.

The release baseline is what users already have. For a package released from
`main`, it is `main` / `origin/main`. For a package that does not exist on
`main` yet, such as one in prerelease on `next`, it is that package's last
published version, and `.changeset/pre.json` lists the changesets that already
shipped in it.

Before creating or editing a changeset, answer one question:

> What will a user upgrading from the release baseline observe?

If a symbol, option, behavior, file, or bug never existed in the release
baseline, do **not** write a removal, migration, or breaking changeset for it.
Instead, describe only the final user-visible delta from the baseline, or write
no changeset if there is no published package delta. Amend an unreleased
changeset that already describes the change instead of adding a duplicate.

Write changesets for the user-visible delta from the release baseline. That means:

- describe what users upgrading from the baseline need to know
- describe migration steps only when the user actually has to do something
- prefer API shape, runtime behavior, serialized data shape, or config changes
- check whether any named removed/renamed API actually exists in the baseline
  before writing removal or migration prose

Do not write:

- last-commit-relative removals for APIs introduced and deleted on the same
  branch
- implementation diary
- architecture rationale
- internal ownership or boundary language
- test coverage notes
- "editor-owned", "normalize path", "wrap semantics", or similar internal phrasing unless the public API literally uses those words

If a package changed internally on this branch but has no user-visible delta from
the baseline, do not write a changeset for that package.

### 4. Registry work gets a registry changelog entry

If changes are only under `apps/www/src/registry/`, do **not** write a package
changeset; add a registry changelog entry per the
[registry reference](./references/registry.md). Mixed package and registry work
may need both.

`sync-plate-ui` is for downstream user apps consuming the generated JSON. Do not use it to produce upstream Plate changelog entries.

### 5. Style

Use imperative voice:

- `Add support for X`
- `Fix Y behavior`
- `Remove deprecated Z`

Do not use:

- `Added ...`
- `We fixed ...`

Keep simple changes to one line:

```md
- Fix `asChild` TypeScript error
- Add `disabled` prop to Button
```

Use code examples only when needed:

```tsx
// Before
import { LegacyPlugin } from 'platejs';

// After
import { ExamplePlugin } from 'platejs';
```

Focus on user impact only. No implementation diary.
Copy API calls from the accepted, shipped source. Changesets report an API
decision; they never make one. Route unresolved shape to `best-api`.

Prefer this shape:

- one summary sentence
- optional short `**Migration:**` block
- optional before/after example only when migration would be ambiguous

If a sentence would sound stupid in release notes, cut it.

## Template

Simple:

```md
---
"platejs": patch
---

Fix `isEmpty` not handling void elements correctly
```

API change:

````md
---
"platejs": patch
---

Rename `LegacyPlugin` to `ExamplePlugin`

```tsx
// Before
import { LegacyPlugin } from 'platejs';

// After
import { ExamplePlugin } from 'platejs';
```
````

Breaking change:

````md
---
"platejs": major
---

Remove `LegacyPlugin`; use `ExamplePlugin`

**Migration:** Replace `LegacyPlugin` in your plugin list:

```tsx
const plugins = [ExamplePlugin];
```
````

## Red Flags

Before shipping:

- [ ] Used `minor` for `plitejs` or `platejs`? Change to `patch`
- [ ] Multiple packages in frontmatter? Split files
- [ ] Describes the last commit, working tree, or branch-only API instead of the
      user-visible delta from the release baseline? Rewrite it
- [ ] Claims an API was removed or needs migration without proving that API
      exists in the release baseline? Delete that claim
- [ ] Past tense verbs? Fix them
- [ ] Multiple paragraphs? Condense
- [ ] Too much explanation? Cut it
- [ ] API change without before/after? Add one

## Managed auto-release choice

For PR-body edits, preserve the existing `auto-release` marker block and its
checked state. `tooling/scripts/auto-release-pr.mjs` owns normalization;
`.github/workflows/changeset-auto-release.yml` supplies the default for a new
block and excludes Version Packages PRs. Do not copy that policy into another rule or
hand-toggle a release choice during prose cleanup. Creating or changing the
release choice still requires the active request's authority. Read these owners
when the task actually changes auto-release behavior.
