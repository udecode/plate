---
description: 'Command: changeset'
name: changeset
metadata:
  skiller:
    source: .agents/rules/changeset.mdc
---

# Changeset

Changesets document package changes for release. Concise bullets, imperative voice, user impact only.

**Core principle:** one action verb + one impact statement = one bullet.

## When To Use

Use when:

- Creating `.changeset/*.md` files
- Documenting package changes: feat, fix, breaking
- Updating `docs/components/changelog.mdx` for registry work

Do not use for:

- Internal docs
- Commit messages
- PR descriptions

## Critical Rules

### 1. Core packages: no `minor`

**Forbidden:** `minor` changesets for:

- `@platejs/slate`
- `@platejs/core`
- `platejs`

Use `patch` instead. `minor` on those explodes version bumps across dependents.

```yaml
# Wrong
---
"@platejs/core": minor
---

# Correct
---
"@platejs/core": patch
---
```

Only real breaking changes get `major`.

### 2. One package per file

Never combine packages in one changeset.

```bash
# Wrong
---
'@platejs/core': patch
'@platejs/utils': patch
---

# Correct
.changeset/core-fix-types.md
.changeset/utils-add-helper.md
```

### 3. Relative to `main`, not to your thought process

Write changesets for the user-visible delta from the current `main` branch.

That means:

- describe what users upgrading from `main` need to know
- describe migration steps only when the user actually has to do something
- prefer API shape, runtime behavior, serialized data shape, or config changes

Do not write:

- implementation diary
- architecture rationale
- internal ownership or seam language
- test coverage notes
- "editor-owned", "normalize path", "wrap semantics", or similar internal phrasing unless the public API literally uses those words

If a package changed internally on this branch but has no user-visible delta from
`main`, do not write a changeset for that package.

### 4. Registry work is changelog work

If changes are only under `apps/www/src/registry/`, do **not** write a package changeset.

Update `docs/components/changelog.mdx` instead.

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
editor.api.foo();

// After
editor.tf.foo();
```

Focus on user impact only. No implementation diary.

Prefer this shape:

- one summary sentence
- optional short `**Migration:**` block
- optional before/after example only when migration would be ambiguous

If a sentence would sound stupid in release notes, cut it.

## Template

Simple:

```md
---
"@platejs/utils": patch
---

Fix `isEmpty` not handling void elements correctly
```

API change:

````md
---
"@platejs/core": patch
---

Rename `editor.api.foo` to `editor.tf.foo`

```tsx
// Before
editor.api.foo();

// After
editor.tf.foo();
```
````

Breaking change:

````md
---
'@platejs/basic-nodes': major
---

Remove `SkipMarkPlugin`; functionality is built into core

**Migration:** Remove `SkipMarkPlugin` from your plugin list. Configure marks directly:

```tsx
MyMarkPlugin.configure({
  rules: { selection: { affinity: 'outward' } },
});
```
````

## Red Flags

Before shipping:

- [ ] Used `minor` for `@platejs/slate`, `@platejs/core`, or `platejs`? Change to `patch`
- [ ] Multiple packages in frontmatter? Split files
- [ ] Describes internals instead of the user-visible delta from `main`? Rewrite it
- [ ] Past tense verbs? Fix them
- [ ] Multiple paragraphs? Condense
- [ ] Too much explanation? Cut it
- [ ] API change without before/after? Add one

## Registry Changelog Format

For `apps/www/src/registry` changes:

```md
### [Month Day] #[Version]
- **`component-name`**: Brief description
  - Migration note if actually needed
```

Same style rules: concise, imperative, user impact only.
