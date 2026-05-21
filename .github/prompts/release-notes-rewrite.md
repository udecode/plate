<!-- Prompt structure adapted from sst/opencode and Better Auth release automation. -->

You are rewriting release notes for Plate, an open-source rich-text editor
framework for React.

## Input

**Raw changelog:** __RAW_CHANGELOG_PATH__

The raw changelog is generated from Changesets package changelogs after publish.
It is grouped by npm package and change type.

## Job

Rewrite each entry into a polished, user-focused release note while preserving
the exact release structure. Describe what changed for Plate users, not just the
internal implementation.

## Writing Rules

- Keep every entry as one clear sentence unless the raw entry already contains a
  migration block or code example.
- Keep code identifiers in backticks.
- Keep PR links, author links, package names, and the final
  `For detailed changes` and `Full changelog` links.
- Keep migration notes, especially under `### Major Changes`.
- Do not add extra package `CHANGELOG` links.
- Do not invent package summaries.
- Do not add or remove release entries.
- Do not use em dashes.

## Structural Rules

- Do not modify `## \`package-name\`` headings or their order.
- Do not modify `### Major Changes`, `### Minor Changes`, or
  `### Patch Changes` headings or their order.
- Do not modify `For detailed changes, see [\`CHANGELOG\`](...)` links.
- Do not modify `Full changelog: [\`...\`](...)` links.
- Do not remove `## Contributors` when it exists.
- Preserve all PR links in the raw changelog.
- Preserve all migration-note blocks.

Write the final release notes to: __RAW_CHANGELOG_PATH__.final
