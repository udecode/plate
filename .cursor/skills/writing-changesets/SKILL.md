---
name: writing-changesets
description: 'Skill: writing-changesets'
---

# Writing Changesets

## Overview

Changesets document package changes for release. Concise bullets, imperative voice, user impact only.

**Core principle:** One action verb + one impact statement = one bullet point.

## When to Use

Use when:

- Creating `.changeset/*.md` files
- Documenting package changes (feat/fix/breaking)
- Writing for `docs/components/changelog.mdx`

Don't use for:

- Internal documentation
- Commit messages (different style)
- PR descriptions (different audience)

## Critical Rules

### 1. Core Dependency Change Types

**FORBIDDEN: `minor` changesets for core dependencies**

Core dependencies that MUST use `patch` instead of `minor`:

- `@platejs/slate`
- `@platejs/core`
- `platejs`

**Why:** Minor bumps to core dependencies trigger major version bumps in ALL dependent packages. Use `patch` to avoid cascade.

```yaml
# ❌ WRONG - causes cascade
---
"@platejs/core": minor
---
# ✅ CORRECT
---
"@platejs/core": patch
---
```

**Only exception:** Actual breaking changes use `major`.

### 2. One Package Per File

Create separate changeset file for EACH package:

```bash
# ❌ WRONG - multiple packages in one file
---
'@platejs/core': patch
'@platejs/utils': patch
---

# ✅ CORRECT - separate files
.changeset/core-fix-types.md       # Only @platejs/core
.changeset/utils-add-helper.md     # Only @platejs/utils
```

### 3. Radix UI Style

**Imperative voice** (not past tense):

- ✅ "Add support for X"
- ✅ "Fix Y behavior"
- ✅ "Remove deprecated Z"
- ❌ "Added support" (past tense)
- ❌ "We have fixed" (narrative)

**One-line bullets for simple changes:**

```markdown
- Fix `asChild` TypeScript error
- Add `disabled` prop to Button
```

**Minimal code examples only when needed:**

```tsx
// Before
editor.api.foo();

// After
editor.tf.foo();
```

**Bold for packages/plugins/properties:**

- **BoldPlugin** not BoldPlugin
- **`textAlign`** for code properties

## Common Mistakes

| Mistake                        | Fix                               |
| ------------------------------ | --------------------------------- |
| "Minor for core packages"      | Use patch - minor causes cascade  |
| Multiple packages in one file  | Separate file per package         |
| Past tense verbs               | Use imperative (Add, Fix, Remove) |
| Multiple paragraphs            | One bullet point                  |
| Implementation details         | User-facing impact only           |
| No code example for API change | Show before/after                 |
| Too much context               | Action + impact only              |

## Changeset Template

**Simple fix:**

```markdown
---
"@platejs/utils": patch
---

Fix `isEmpty` not handling void elements correctly
```

**API change with example:**

````markdown
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

````

**Breaking change:**
```markdown
---
'@platejs/basic-nodes': major
---

Remove `SkipMarkPlugin` - functionality now built into core

**Migration:** Remove `SkipMarkPlugin` from your plugin list. Configure marks directly:
```tsx
MyMarkPlugin.configure({
  rules: { selection: { affinity: 'outward' } }
})
````

````

## Red Flags - STOP

**Before submitting changeset, check:**

- [ ] Using `minor` for @platejs/slate, @platejs/core, or platejs? → Change to `patch`
- [ ] Multiple packages in frontmatter? → Separate files
- [ ] Past tense verbs? → Change to imperative
- [ ] Multiple paragraphs? → Condense to bullet points
- [ ] Explaining "why" in detail? → Remove - show impact only
- [ ] No code example for API change? → Add before/after

## Changelog Updates (Registry Changes)

For `apps/www/src/registry` changes, update `docs/components/changelog.mdx`:

**Format:**
```markdown
### [Month Day] #[Version]
- **`component-name`**: Brief description of change
  - Sub-bullet for migration notes if needed
````

**Style rules apply:** Concise, imperative, user impact only.

## Rationalization Table

| Excuse                              | Reality                                                |
| ----------------------------------- | ------------------------------------------------------ |
| "Minor seems right for new feature" | Core packages must use patch - minor breaks dependents |
| "Users need context"                | Users need impact. Context goes in docs.               |
| "More detail is better"             | Shadcn proves brevity works. One bullet per change.    |
| "Should explain implementation"     | Users don't care. Show API change only.                |
| "Past tense is clearer"             | Imperative is standard. Match shadcn/ui.               |
| "Easier to combine packages"        | Separate files enable proper SemVer. Never combine.    |

**All of these mean: Follow the rules. No exceptions.**
