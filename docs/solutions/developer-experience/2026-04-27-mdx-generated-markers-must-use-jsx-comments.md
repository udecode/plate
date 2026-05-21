---
title: Generated MDX markers must use JSX comments
date: 2026-04-27
category: docs/solutions/developer-experience
module: Docs release automation
problem_type: developer_experience
component: documentation
symptoms:
  - Contentlayer failed while processing a generated MDX document.
  - The error pointed at an HTML comment marker in a generated MDX release page.
root_cause: wrong_api
resolution_type: tooling_addition
severity: low
tags: [contentlayer, mdx, release-docs, tooling]
---

# Generated MDX markers must use JSX comments

## Problem

The release sync script needed stable markers so it could replace the generated release timeline in the releases MDX page. HTML comments looked harmless, but this Contentlayer + MDX pipeline rejects them.

## Symptoms

- `pnpm --filter www typecheck` failed during `contentlayer2 build`.
- The MDX error said: `Unexpected character ! (U+0021)` and pointed at `<!-- release-timeline:start -->`.

## What Didn't Work

- Plain HTML comments:

  ```mdx
  <!-- release-timeline:start -->
  <ReleaseTimeline releases={[]} />
  <!-- release-timeline:end -->
  ```

  This does not compile in this MDX setup.

## Solution

Generate JSX comments instead:

```mdx
{/* release-timeline:start */}
<ReleaseTimeline releases={[]} />
{/* release-timeline:end */}
```

When changing an existing generator, keep a legacy replacement path for any already-written HTML markers:

```js
const releaseTimelineStartMarker = '{/* release-timeline:start */}';
const releaseTimelineEndMarker = '{/* release-timeline:end */}';
const legacyReleaseTimelineStartMarker = '<!-- release-timeline:start -->';
const legacyReleaseTimelineEndMarker = '<!-- release-timeline:end -->';
```

## Why This Works

MDX treats `{/* ... */}` as a JSX comment expression, so the marker is valid inside MDX and invisible in the rendered page. Keeping legacy marker detection makes the sync script self-heal old generated content on the next run.

## Prevention

- For generated MDX markers, use JSX comments, not HTML comments.
- Run `pnpm --filter www typecheck` after changing generated MDX structure. Contentlayer catches parser errors before the docs app reaches runtime.

## Related Issues

- Related local files: `tooling/scripts/sync-release-docs.mjs`, `content/releases/index.mdx`.
