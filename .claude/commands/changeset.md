# How to Create a Plate Project Changeset

This guide outlines the structure and writing style for creating changeset files in the Plate project, aiming for clarity and conciseness similar to the Radix UI changelog style.

## Registry Changes: Changelog Updates

**When changes are made to `apps/www/src/registry/` components**, you MUST also update `docs/components/changelog.mdx` to document component changes, additions, or removals.

**Changelog Standards:**

- Update `docs/components/changelog.mdx` following the existing format and style
- Document component changes, additions, or removals
- Include any breaking changes or migration notes for registry components
- Use consistent version numbering
- Follow the existing changelog structure and writing style

**Note:** Registry component changes require changelog updates, NOT changeset files, since registry components are not published as npm packages.

## Package Changes: Changeset Files

For changes to packages in the `packages/` directory, create changeset files as described below.

## File Naming Convention

Changeset files should be named descriptively, indicating the affected package/area and the nature of the change.

`[package]-[change-type].md`

Examples:

- `alignment-major.md`
- `core-minor.md`
- `core-patch.md`
- `slate-major.md`
- `slate-minor.md`

## Changeset File Structure

Each changeset `.md` file must consist of two main parts:

1.  **YAML Frontmatter**: Specifies the package(s) affected and the type of change (`major`, `minor`, `patch`).
2.  **Markdown Description**: Details the specific change(s) covered by this file.

### 1. YAML Frontmatter

The frontmatter is enclosed by ---` lines. It lists each affected package and its corresponding change type.

**Syntax:**

```yaml
---
'@udecode/package-name': <change-type>
# ... only list packages relevant to THIS specific changeset file
---
```

- `<change-type>` **MUST** be:
  - `major`: For **breaking changes** ONLY. A change is breaking if users of the package need to change their code to upgrade (e.g., API renaming, function signature changes, removal of features, behavior changes that require user adaptation).
  - `minor`: For **new features** or significant enhancements that are backward-compatible ONLY.
  - `patch`: For **bug fixes** or very minor, backward-compatible changes ONLY.

**Important Note on SemVer Bumping and Multiple Changesets:**

- Each distinct change (breaking, feature, fix) for a package **MUST** have its own changeset file.
- A single changeset file **MUST** contain only ONE package in its frontmatter.
- For example, if you make a breaking API change, add a new feature, and fix a bug in `@platejs/core` for an upcoming release, you will create **three separate changeset files**:
  1.  One file marked `major` for `@platejs/core` detailing only the breaking change.
  2.  One file marked `minor` for `@platejs/core` detailing only the new feature.
  3.  One file marked `patch` for `@platejs/core` detailing only the bug fix.
- The versioning tool will look at all pending changesets for a package. If there's at least one `major` file, the package gets a major version bump, and all changes (from major, minor, and patch files) are included in that release. If no `major` but at least one `minor`, it gets a minor bump, and so on.

**Example: Multiple Changes, Multiple Packages**

- If a PR adds a `minor` feature to `@platejs/core` and a `patch` fix to `@platejs/utils`, you MUST create TWO separate files:

  1.  `core-minor.md` (containing only `'@platejs/core': minor`)
  2.  `utils-patch.md` (containing only `'@platejs/utils': patch`)

- If a PR adds `minor` features to both `@platejs/core` and `@platejs/utils`, you MUST create TWO separate `minor` changeset files, one for each package. DO NOT group them in a single file.

**Example (Illustrating multiple files for one package):**

File 1: `core-major.md`

````yaml
---
'@platejs/core': major
---
- Renamed `oldApi()` to `newApi()`.
  ```ts
  // Before
  editor.oldApi();
  // After
  editor.newApi();
````

File 2: `core-minor.md`

```yaml
---
'@platejs/core': minor
---
- Added `useCoreHook()` for enhanced state management.
```

File 3: `core-patch.md`

```yaml
---
'@platejs/core': patch
---
- Fixed an issue where X would cause Y.
```

### 2. Markdown Description

This section explains **what changed for the user** and **how they should adapt** for the _specific change described in this file_. The style should be direct and action-oriented.

**General Guidelines:**

- **Focus on Public API & User Impact:** Only document changes that affect the public API or require users to take action. **DO NOT** document internal refactorings.
- **Always use bullet points (-`)** to list out the specific change(s) pertinent to this changeset's type (major, minor, or patch).
- **Start Directly with a Verb:** Each bullet point should begin with a past tense verb describing the change (e.g., "Renamed...", "Added...", "Fixed...", "Removed...").
- **Be Direct and Concise:**
  - Get straight to the point. Avoid verbose explanations or justifications.
  - If a code snippet clearly shows the "before" and "after," **let the code snippet speak for itself.** Minimize or eliminate redundant introductory text for code blocks.
- Use **bold text (`**text**`)** for emphasis on:
  - Package names (e.g., `**@platejs/core**`)
  - Plugin names (e.g., `**BlockquotePlugin**`)
  - Important function, option, or property names being changed.
- Use **code blocks** (```tsx) for:
  - Illustrating API changes (using "Before" / "After" comments inside the block). Snippets should be minimal and focused.
  - Showing configuration snippets.
  - Displaying relevant parts of type definitions.
- **Migration Guidance:** If a change requires user action (especially for `major` changes), provide clear, concise migration steps.

**Specific Content Types (Structure within bullet points):**

- **Breaking Changes (`major` changeset):**

  - - Renamed `EditorFragmentOptions.structuralTypes` to `EditorFragmentOptions.containerTypes` in `**@platejs/slate**`.

    ```ts
    // Before
    editor.api.fragment(editor.selection, { structuralTypes: ['div'] });

    // After
    editor.api.fragment(editor.selection, { containerTypes: ['div'] });
    ```

  - - Removed `oldOption` from `PluginName` options. Use `newOption` instead.

    ```ts
    // Before
    createMyPlugin({ oldOption: true });

    // After
    createMyPlugin({ newOption: true });
    ```

- **Deprecations (can be `major` if immediate removal or `minor` if still available with warnings):**

  - If removed in this version (major): - Removed `**@platejs/old-package**`. Use `**@platejs/new-package**` instead.
  - If only deprecated (minor): - Deprecated `**@platejs/old-package**`. It will be removed in a future version. Use `**@platejs/new-package**` instead.
  - Provide migration steps:
    - To migrate:
      - Replace `**@platejs/old-package**` with `**@platejs/new-package**` in your `package.json`.
      - Update import paths:
        ```diff
        - import { SomeFeature } from '@platejs/old-package';
        + import { SomeFeature } from '@platejs/new-package';
        ```
        `

- \*\*New Features / Enhancements (`
